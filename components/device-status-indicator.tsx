"use client";

import { DeviceStatus } from "@/hooks/use-device-monitoring";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Battery, Thermometer } from "lucide-react";

interface DeviceStatusIndicatorProps {
  deviceStatus: DeviceStatus;
  compact?: boolean;
  showOnlyWarnings?: boolean;
}

export function DeviceStatusIndicator({
  deviceStatus,
  compact = true,
  showOnlyWarnings = false,
}: DeviceStatusIndicatorProps) {
  const { battery, thermal } = deviceStatus;
  const batteryPercentage = Math.round(battery.level * 100);

  // Determine if we should show warning states
  const isBatteryLow = batteryPercentage < 20 && !battery.charging;
  const isThermalWarning = thermal.thermalLevel !== "normal";
  const showWarning = isBatteryLow || isThermalWarning;

  // If showOnlyWarnings is true and no warnings, don't show anything
  if (showOnlyWarnings && !showWarning) return null;

  if (compact) {
    return (
      <AnimatePresence>
        <div className="flex items-center gap-2 text-xs">
          {/* Battery */}
          {battery.isSupported && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Battery
                className={cn(
                  "w-3 h-3",
                  batteryPercentage > 50
                    ? "text-green-500"
                    : batteryPercentage > 20
                      ? "text-yellow-500"
                      : "text-red-500"
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  batteryPercentage > 50
                    ? "text-green-500"
                    : batteryPercentage > 20
                      ? "text-yellow-500"
                      : "text-red-500"
                )}
              >
                {batteryPercentage}%
              </span>
              {battery.charging && <span className="animate-pulse">⚡</span>}
            </motion.div>
          )}

          {/* Thermal Status */}
          {isThermalWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Thermometer
                className={cn(
                  "w-3 h-3",
                  thermal.thermalLevel === "critical"
                    ? "text-red-500"
                    : thermal.thermalLevel === "hot"
                      ? "text-orange-500"
                      : "text-yellow-500"
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  thermal.thermalLevel === "critical"
                    ? "text-red-500"
                    : thermal.thermalLevel === "hot"
                      ? "text-orange-500"
                      : "text-yellow-500"
                )}
              >
                {thermal.estimatedTemp}°C
              </span>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    );
  }

  // Full view
  return (
    <div className="p-4 space-y-3 border rounded-lg bg-muted/50">
      <h3 className="font-semibold text-sm">Device Health</h3>

      {battery.isSupported && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Battery:
            </span>
            <span
              className={cn(
                "font-medium",
                batteryPercentage > 50
                  ? "text-green-500"
                  : batteryPercentage > 20
                    ? "text-yellow-500"
                    : "text-red-500"
              )}
            >
              {batteryPercentage}% {battery.charging ? "⚡" : ""}
            </span>
          </div>
          {battery.chargingTime < Infinity && battery.charging && (
            <p className="text-xs text-muted-foreground">
              Time to full: {Math.round(battery.chargingTime / 60)}m
            </p>
          )}
          {battery.dischargingTime < Infinity && !battery.charging && (
            <p className="text-xs text-muted-foreground">
              Time remaining: {Math.round(battery.dischargingTime / 3600)}h
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Thermal:
          </span>
          <span
            className={cn(
              "font-medium capitalize",
              thermal.thermalLevel === "critical"
                ? "text-red-500"
                : thermal.thermalLevel === "hot"
                  ? "text-orange-500"
                  : thermal.thermalLevel === "warm"
                    ? "text-yellow-500"
                    : "text-green-500"
            )}
          >
            {thermal.thermalLevel}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimated Temp:</span>
          <span className="font-medium">{thermal.estimatedTemp}°C</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">CPU Usage:</span>
          <span className="font-medium">{Math.round(thermal.cpuUsage)}%</span>
        </div>
        {thermal.isThrottled && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Thermal throttling detected</span>
          </div>
        )}
      </div>
    </div>
  );
}
