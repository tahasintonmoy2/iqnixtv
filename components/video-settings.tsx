"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBandwidth } from "@/lib/bandwidth-detection"

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2
type SubtitleSettings = {
  enabled: boolean
  language: string
}

type VideoSettingsProps = {
  videoQuality: string
  setVideoQuality: (quality: string) => void
  actualQuality: string
  playbackSpeed: number
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  subtitles: SubtitleSettings
  setSubtitles: (subtitles: SubtitleSettings) => void
  bandwidth: number | null
  onClose: () => void
  qualityLevels: string[]
}

export function VideoSettings({
  videoQuality,
  setVideoQuality,
  actualQuality,
  playbackSpeed,
  setPlaybackSpeed,
  subtitles,
  setSubtitles,
  bandwidth,
  onClose,
  qualityLevels,
}: VideoSettingsProps) {
  const [activeTab, setActiveTab] = useState("quality")
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

  const handleSubtitleToggle = (enabled: boolean) => {
    setSubtitles({ ...subtitles, enabled })
  }

  const handleSubtitleLanguageChange = (language: string) => {
    setSubtitles({ ...subtitles, language })
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="absolute bottom-16 right-0 w-72 bg-black/90 backdrop-blur-md rounded-lg shadow-xl z-50 overflow-hidden"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="font-medium text-white">Settings</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white hover:bg-white/10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-white/10">
            <TabsTrigger
              value="quality"
              className="data-[state=active]:bg-white/10 data-[state=active]:shadow-none rounded-none text-white"
            >
              Quality
            </TabsTrigger>
            <TabsTrigger
              value="subtitles"
              className="data-[state=active]:bg-white/10 data-[state=active]:shadow-none rounded-none text-white"
            >
              Subtitles
            </TabsTrigger>
            <TabsTrigger
              value="speed"
              className="data-[state=active]:bg-white/10 data-[state=active]:shadow-none rounded-none text-white"
            >
              Speed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quality" className="p-3">
            {bandwidth && (
              <div className="mb-3 p-2 bg-white/5 rounded-md text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span className="text-white font-medium">Network Speed</span>
                </div>
                <div className="text-white/80 pl-6">{formatBandwidth(bandwidth)}</div>
                {videoQuality === "auto" && (
                  <div className="text-white/80 pl-6 mt-1">
                    <span>Auto-selected: </span>
                    <span className="font-medium text-primary">{actualQuality}</span>
                  </div>
                )}
              </div>
            )}

            <RadioGroup value={videoQuality} onValueChange={(value) => setVideoQuality(value)}>
              {/* Always show Auto option first */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="quality-auto" className="flex items-center text-white cursor-pointer w-full">
                  Auto (Recommended)
                </Label>
                <RadioGroupItem value="auto" id="quality-auto" className="text-primary border-white/50" />
              </div>

              {/* Show available quality levels from HLS */}
              {qualityLevels
                .filter((quality) => quality !== "Auto") // Skip Auto since we already added it
                .map((quality) => (
                  <div key={quality} className="flex items-center justify-between py-2">
                    <Label
                      htmlFor={`quality-${quality}`}
                      className="flex items-center text-white cursor-pointer w-full"
                    >
                      {quality}
                      {quality === actualQuality && videoQuality !== "auto" && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Current</span>
                      )}
                    </Label>
                    <RadioGroupItem
                      value={quality}
                      id={`quality-${quality}`}
                      className="text-primary border-white/50"
                    />
                  </div>
                ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="subtitles" className="p-3">
            <div className="flex items-center justify-between py-2 mb-3 border-b border-white/10">
              <Label htmlFor="subtitle-toggle" className="text-white">
                Show Subtitles
              </Label>
              <Switch id="subtitle-toggle" checked={subtitles.enabled} onCheckedChange={handleSubtitleToggle} />
            </div>

            <RadioGroup
              value={subtitles.language}
              onValueChange={handleSubtitleLanguageChange}
              className={subtitles.enabled ? "opacity-100" : "opacity-50 pointer-events-none"}
            >
              {[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
                { value: "ja", label: "Japanese" },
              ].map((lang) => (
                <div key={lang.value} className="flex items-center justify-between py-2">
                  <Label
                    htmlFor={`subtitle-${lang.value}`}
                    className="flex items-center text-white cursor-pointer w-full"
                  >
                    {lang.label}
                  </Label>
                  <RadioGroupItem
                    value={lang.value}
                    id={`subtitle-${lang.value}`}
                    className="text-primary border-white/50"
                    disabled={!subtitles.enabled}
                  />
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="speed" className="p-3">
            <RadioGroup
              value={playbackSpeed.toString()}
              onValueChange={(value) => setPlaybackSpeed(Number.parseFloat(value) as PlaybackSpeed)}
            >
              {[
                { value: "0.5", label: "0.5x" },
                { value: "0.75", label: "0.75x" },
                { value: "1", label: "Normal" },
                { value: "1.25", label: "1.25x" },
                { value: "1.5", label: "1.5x" },
                { value: "1.75", label: "1.75x" },
                { value: "2", label: "2x" },
              ].map((speed) => (
                <div key={speed.value} className="flex items-center justify-between py-2">
                  <Label
                    htmlFor={`speed-${speed.value}`}
                    className="flex items-center text-white cursor-pointer w-full"
                  >
                    {speed.label}
                  </Label>
                  <RadioGroupItem
                    value={speed.value}
                    id={`speed-${speed.value}`}
                    className="text-primary border-white/50"
                  />
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  )
}
