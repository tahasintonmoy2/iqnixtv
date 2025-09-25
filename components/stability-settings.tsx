"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StabilityConfig } from "@/lib/hls-manager"

type StabilitySettingsProps = {
  config: StabilityConfig
  onUpdateConfig: (config: Partial<StabilityConfig>) => void
  recentQualityChanges: { time: number; quality: string }[]
  onClose: () => void
}

export function StabilitySettings({ config, onUpdateConfig, recentQualityChanges, onClose }: StabilitySettingsProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleToggleStability = (enabled: boolean) => {
    onUpdateConfig({ enabled })
  }

  const handleBufferThresholdChange = (value: number[]) => {
    onUpdateConfig({ bufferThreshold: value[0] })
  }

  const handleBandwidthSafetyFactorChange = (value: number[]) => {
    onUpdateConfig({ bandwidthSafetyFactor: value[0] / 100 })
  }

  const handleQualityCooldownChange = (value: number[]) => {
    onUpdateConfig({ qualityCooldownMs: value[0] * 1000 })
  }

  const handleGradualSwitchChange = (enabled: boolean) => {
    onUpdateConfig({ gradualSwitch: enabled })
  }

  const handleStartupProfileChange = (profile: StabilityConfig["startupProfile"]) => {
    onUpdateConfig({ startupProfile: profile })
  }

  const handleHysteresisFactorChange = (value: number[]) => {
    onUpdateConfig({ hysteresisFactor: value[0] / 100 })
  }

  // Calculate quality change frequency
  const qualityChangesPerMinute = recentQualityChanges.length

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="absolute bottom-16 right-0 w-80 bg-black/90 backdrop-blur-md rounded-lg shadow-xl z-50 overflow-hidden"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="font-medium text-white">Quality Stability Settings</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white hover:bg-white/10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Label htmlFor="stability-toggle" className="text-white font-medium">
              Enable Quality Stability
            </Label>
            <Switch id="stability-toggle" checked={config.enabled} onCheckedChange={handleToggleStability} />
          </div>
          <p className="text-xs text-white/70 mt-1">Prevents abrupt quality changes during playback</p>

          <div className="mt-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs text-white/70">
              Quality changes in last minute: <span className="font-medium text-white">{qualityChangesPerMinute}</span>
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-white/10">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-white/10 data-[state=active]:shadow-none rounded-none text-white"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-white/10 data-[state=active]:shadow-none rounded-none text-white"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="p-3 space-y-4">
            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="mb-1">
                <Label htmlFor="buffer-threshold" className="text-white text-sm">
                  Buffer Threshold: {config.bufferThreshold}s
                </Label>
              </div>
              <Slider
                id="buffer-threshold"
                value={[config.bufferThreshold]}
                min={2}
                max={30}
                step={1}
                onValueChange={handleBufferThresholdChange}
                disabled={!config.enabled}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary"
              />
              <p className="text-xs text-white/70 mt-1">Minimum buffer required before increasing quality</p>
            </div>

            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="mb-1">
                <Label htmlFor="bandwidth-safety" className="text-white text-sm">
                  Bandwidth Safety: {Math.round(config.bandwidthSafetyFactor * 100)}%
                </Label>
              </div>
              <Slider
                id="bandwidth-safety"
                value={[config.bandwidthSafetyFactor * 100]}
                min={30}
                max={90}
                step={5}
                onValueChange={handleBandwidthSafetyFactorChange}
                disabled={!config.enabled}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary"
              />
              <p className="text-xs text-white/70 mt-1">
                Percentage of detected bandwidth to use (lower = more stable)
              </p>
            </div>

            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="mb-1">
                <Label htmlFor="quality-cooldown" className="text-white text-sm">
                  Quality Change Cooldown: {config.qualityCooldownMs / 1000}s
                </Label>
              </div>
              <Slider
                id="quality-cooldown"
                value={[config.qualityCooldownMs / 1000]}
                min={2}
                max={20}
                step={1}
                onValueChange={handleQualityCooldownChange}
                disabled={!config.enabled}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary"
              />
              <p className="text-xs text-white/70 mt-1">Minimum time between quality changes</p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="p-3 space-y-4">
            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="flex items-center justify-between">
                <Label htmlFor="gradual-switch" className="text-white text-sm">
                  Gradual Quality Switching
                </Label>
                <Switch
                  id="gradual-switch"
                  checked={config.gradualSwitch}
                  onCheckedChange={handleGradualSwitchChange}
                  disabled={!config.enabled}
                />
              </div>
              <p className="text-xs text-white/70 mt-1">Change quality one level at a time instead of jumping</p>
            </div>

            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <Label className="text-white text-sm block mb-2">Startup Profile</Label>
              <RadioGroup
                value={config.startupProfile}
                onValueChange={(value) => handleStartupProfileChange(value as StabilityConfig["startupProfile"])}
                disabled={!config.enabled}
              >
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="startup-conservative" className="text-white text-sm cursor-pointer">
                    Conservative (Start Low)
                  </Label>
                  <RadioGroupItem
                    value="conservative"
                    id="startup-conservative"
                    className="text-primary border-white/50"
                    disabled={!config.enabled}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="startup-moderate" className="text-white text-sm cursor-pointer">
                    Moderate (Balanced)
                  </Label>
                  <RadioGroupItem
                    value="moderate"
                    id="startup-moderate"
                    className="text-primary border-white/50"
                    disabled={!config.enabled}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="startup-aggressive" className="text-white text-sm cursor-pointer">
                    Aggressive (Start High)
                  </Label>
                  <RadioGroupItem
                    value="aggressive"
                    id="startup-aggressive"
                    className="text-primary border-white/50"
                    disabled={!config.enabled}
                  />
                </div>
              </RadioGroup>
              <p className="text-xs text-white/70 mt-1">How to select quality when playback starts</p>
            </div>

            <div className={config.enabled ? "" : "opacity-50 pointer-events-none"}>
              <div className="mb-1">
                <Label htmlFor="hysteresis-factor" className="text-white text-sm">
                  Hysteresis Factor: {Math.round(config.hysteresisFactor * 100)}%
                </Label>
              </div>
              <Slider
                id="hysteresis-factor"
                value={[config.hysteresisFactor * 100]}
                min={0}
                max={50}
                step={5}
                onValueChange={handleHysteresisFactorChange}
                disabled={!config.enabled}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary"
              />
              <p className="text-xs text-white/70 mt-1">Prevents oscillation between quality levels</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-3 border-t border-white/10 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateConfig(DEFAULT_STABILITY_CONFIG)}
            className="text-xs"
          >
            Reset to Defaults
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Default stability configuration for reference
const DEFAULT_STABILITY_CONFIG: StabilityConfig = {
  enabled: true,
  bufferThreshold: 10,
  bandwidthSafetyFactor: 0.7,
  qualityCooldownMs: 10000,
  gradualSwitch: true,
  startupProfile: "moderate",
  hysteresisFactor: 0.2,
}
