"use client";

import { useEffect, useState } from "react";

export interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

export interface DeviceStatus {
  battery: {
    level: number; // 0-1 (0% - 100%)
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    isSupported: boolean;
  };
  thermal: {
    isThrottled: boolean;
    cpuUsage: number;
    temperature: number;
    estimatedTemp: number;
    thermalLevel: "normal" | "warm" | "hot" | "critical";
  };
}

/**
 * Hook to monitor device battery, thermal state, and suggest quality adjustments
 * Returns device status and quality recommendations based on device health
 */
export const useDeviceMonitoring = () => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    battery: {
      level: 1,
      charging: false,
      chargingTime: 0,
      dischargingTime: 0,
      isSupported: false,
    },
    thermal: {
      isThrottled: false,
      temperature: 0,
      cpuUsage: 0,
      estimatedTemp: 35,
      thermalLevel: "normal",
    },
  });

  // Monitor Battery Status
  useEffect(() => {
    const initBattery = async () => {
      try {
        if (!("getBattery" in navigator)) {
          console.log("Battery Status API not supported");
          return;
        }

        const bm = await (navigator as NavigatorWithBattery).getBattery();

        const updateBattery = () => {
          setDeviceStatus((prev) => ({
            ...prev,
            battery: {
              level: bm.level,
              charging: bm.charging,
              chargingTime: bm.chargingTime,
              dischargingTime: bm.dischargingTime,
              isSupported: true,
            },
          }));
        };

        updateBattery();

        bm.addEventListener("levelchange", updateBattery);
        bm.addEventListener("chargingchange", updateBattery);

        return () => {
          bm.removeEventListener("levelchange", updateBattery);
          bm.removeEventListener("chargingchange", updateBattery);
        };
      } catch (error) {
        console.log("Battery API initialization failed:", error);
      }
    };

    const cleanup = initBattery();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, []);

  // Monitor Thermal Throttling
  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const measureThermalLoad = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime > 1000) {
        const fps = frameCount;
        const isThrottled = fps < 30;

        // Estimate temperature based on thermal throttling
        const estimatedTemp = isThrottled ? 50 + (30 - fps) : 35;

        let thermalLevel: "normal" | "warm" | "hot" | "critical" = "normal";
        if (fps < 20) thermalLevel = "critical";
        else if (fps < 30) thermalLevel = "hot";
        else if (fps < 45) thermalLevel = "warm";

        setDeviceStatus((prev) => ({
          ...prev,
          thermal: {
            isThrottled,
            temperature: Math.round(estimatedTemp),
            cpuUsage: Math.max(0, 100 - fps),
            estimatedTemp: Math.round(estimatedTemp),
            thermalLevel,
          },
        }));

        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(measureThermalLoad);
    };

    animationFrameId = requestAnimationFrame(measureThermalLoad);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Recommend quality based on device health
  const getQualityRecommendation = (): {
    recommendedHeight: number;
    reason: string;
    shouldReduceQuality: boolean;
  } => {
    const { battery, thermal } = deviceStatus;
    const batteryPercentage = battery.level * 100;

    // Critical thermal condition - reduce quality significantly
    if (thermal.thermalLevel === "critical") {
      return {
        recommendedHeight: 480,
        reason: "Device thermal critical - reducing quality to 480p",
        shouldReduceQuality: true,
      };
    }

    // Hot thermal condition - reduce quality
    if (thermal.thermalLevel === "hot") {
      return {
        recommendedHeight: 720,
        reason: "Device running hot - reducing quality to 720p",
        shouldReduceQuality: true,
      };
    }

    // Low battery and not charging
    if (batteryPercentage < 20 && !battery.charging) {
      return {
        recommendedHeight: 480,
        reason: "Low battery (< 20%) - reducing quality to 480p",
        shouldReduceQuality: true,
      };
    }

    // Warm thermal or battery 20-50% - moderate quality
    if (thermal.thermalLevel === "warm" || (batteryPercentage < 50 && !battery.charging)) {
      return {
        recommendedHeight: 720,
        reason: "Device warm or moderate battery - 720p recommended",
        shouldReduceQuality: true,
      };
    }

    // Normal conditions
    return {
      recommendedHeight: 1080,
      reason: "Device healthy - normal quality",
      shouldReduceQuality: false,
    };
  };

  return {
    
    deviceStatus,
    getQualityRecommendation,
  };
};
