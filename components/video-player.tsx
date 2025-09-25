"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Wifi } from "lucide-react"
import { VideoSettings } from "./video-settings"
import { formatBandwidth } from "@/lib/bandwidth-detection"
import { VideoQualityIndicator } from "./video-quality-indicator"
import { HlsVideoPlayer } from "./hls-video-player"
import type { HlsQualityLevel, HlsStats, StabilityConfig } from "@/lib/hls-manager"
import { StabilitySettings } from "./stability-settings"

// Sample HLS streams for testing
const HLS_STREAMS = {
  // Big Buck Bunny multi-bitrate HLS stream
  bbb: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  // Sintel multi-bitrate HLS stream
  sintel: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  // Tears of Steel multi-bitrate HLS stream
  tears: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
}

// Default stability configuration
const DEFAULT_STABILITY_CONFIG: StabilityConfig = {
  enabled: true,
  bufferThreshold: 10,
  bandwidthSafetyFactor: 0.7,
  qualityCooldownMs: 10000,
  gradualSwitch: true,
  startupProfile: "moderate",
  hysteresisFactor: 0.2,
}

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showStabilitySettings, setShowStabilitySettings] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string>("auto")
  const [actualQuality, setActualQuality] = useState<HlsQualityLevel | null>(null)
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [subtitles, setSubtitles] = useState({ enabled: false, language: "en" })
  const [bandwidth, setBandwidth] = useState<number | null>(null)
  const [showBandwidthInfo, setShowBandwidthInfo] = useState(false)
  const [qualityChanged, setQualityChanged] = useState(false)
  const [hlsStats, setHlsStats] = useState<HlsStats | null>(null)
  const [stabilityConfig, setStabilityConfig] = useState<StabilityConfig>(DEFAULT_STABILITY_CONFIG)
  const [recentQualityChanges, setRecentQualityChanges] = useState<{ time: number; quality: string }[]>([])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle player ready event
  const handlePlayerReady = (videoElement: HTMLVideoElement) => {
    videoRef.current = videoElement
  }

  // Handle quality levels loaded
  const handleQualityLevelsLoaded = (levels: HlsQualityLevel[]) => {
    setQualityLevels(levels)
  }

  // Handle quality change
  const handleQualityChange = (quality: HlsQualityLevel) => {
    setActualQuality(quality)
    setQualityChanged(true)

    // Add to recent quality changes
    const now = Date.now()
    setRecentQualityChanges((prev) => {
      const newChanges = [...prev, { time: now, quality: quality.name }]
      // Keep only changes from the last 60 seconds
      return newChanges.filter((change) => now - change.time < 60000)
    })

    // Reset the flag after 5 seconds
    setTimeout(() => {
      setQualityChanged(false)
    }, 5000)
  }

  // Handle HLS stats update
  const handleStatsUpdate = (stats: HlsStats) => {
    setHlsStats(stats)
    setBandwidth(stats.bandwidth)
  }

  // Handle time update
  const handleTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime)
    setDuration(duration)
  }

  // Set playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // Set volume and mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume / 100
    }
  }, [isMuted, volume])

  // Set quality level
  useEffect(() => {
    if (videoRef.current && "setQuality" in videoRef.current) {
      const levelId =
        selectedQuality === "auto" ? -1 : (qualityLevels.find((q) => q.name === selectedQuality)?.id ?? -1)
      // @ts-ignore - Custom method added to video element
      videoRef.current.setQuality(levelId)
    }
  }, [selectedQuality, qualityLevels])

  // Update stability config when it changes
  useEffect(() => {
    if (videoRef.current && "updateStabilityConfig" in videoRef.current) {
      // @ts-ignore - Custom method added to video element
      videoRef.current.updateStabilityConfig(stabilityConfig)
    }
  }, [stabilityConfig])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const player = playerRef.current
    if (!player) return

    if (!isFullscreen) {
      if (player.requestFullscreen) {
        player.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings && !showStabilitySettings) {
        setShowControls(false)
      }
    }, 3000)
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
    if (!showSettings) {
      setShowStabilitySettings(false)
    }
  }

  const toggleStabilitySettings = () => {
    setShowStabilitySettings(!showStabilitySettings)
    if (!showStabilitySettings) {
      setShowSettings(false)
    }
  }

  const toggleBandwidthInfo = () => {
    setShowBandwidthInfo(!showBandwidthInfo)
  }

  const handleUpdateStabilityConfig = (newConfig: Partial<StabilityConfig>) => {
    setStabilityConfig((prev) => ({ ...prev, ...newConfig }))
  }

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <HlsVideoPlayer
        src={HLS_STREAMS.sintel}
        poster="/placeholder.svg?height=720&width=1280"
        className="w-full h-full"
        muted={isMuted}
        stabilityConfig={stabilityConfig}
        onPlayerReady={handlePlayerReady}
        onQualityLevelsLoaded={handleQualityLevelsLoaded}
        onQualityChange={handleQualityChange}
        onStatsUpdate={handleStatsUpdate}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVideoClick={togglePlay}
      />

      {/* Quality change indicator */}
      {qualityChanged && actualQuality && (
        <VideoQualityIndicator quality={actualQuality.name} bandwidth={bandwidth} isAuto={selectedQuality === "auto"} />
      )}

      {/* Play/Pause overlay button (center) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-20 w-20 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50"
            onClick={togglePlay}
          >
            <Play className="h-10 w-10 fill-white" />
            <span className="sr-only">Play</span>
          </Button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-primary"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/10">
              <SkipBack className="h-6 w-6" />
              <span className="sr-only">Rewind 10s</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/10">
              <SkipForward className="h-6 w-6" />
              <span className="sr-only">Forward 10s</span>
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">
                {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>

              <div className="w-24 hidden md:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                />
              </div>
            </div>

            <div className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleStabilitySettings}
                className={`text-white hover:bg-white/10 ${showStabilitySettings ? "bg-white/20" : ""}`}
                title="Stability Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span className="sr-only">Stability Settings</span>
              </Button>

              {showStabilitySettings && (
                <StabilitySettings
                  config={stabilityConfig}
                  onUpdateConfig={handleUpdateStabilityConfig}
                  recentQualityChanges={recentQualityChanges}
                  onClose={() => setShowStabilitySettings(false)}
                />
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSettings}
                className={`text-white hover:bg-white/10 ${showSettings ? "bg-white/20" : ""}`}
              >
                <Settings className="h-6 w-6" />
                <span className="sr-only">Settings</span>
              </Button>

              {showSettings && (
                <VideoSettings
                  videoQuality={selectedQuality}
                  setVideoQuality={(quality) => setSelectedQuality(quality)}
                  actualQuality={actualQuality?.name || ""}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={(speed) => setPlaybackSpeed(speed)}
                  subtitles={subtitles}
                  setSubtitles={setSubtitles}
                  bandwidth={bandwidth}
                  onClose={() => setShowSettings(false)}
                  qualityLevels={qualityLevels.map((q) => q.name)}
                />
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBandwidthInfo}
                className={`text-white hover:bg-white/10 ${showBandwidthInfo ? "bg-white/20" : ""}`}
              >
                <Wifi className="h-6 w-6" />
                <span className="sr-only">Bandwidth Info</span>
              </Button>

              {showBandwidthInfo && bandwidth && (
                <div className="absolute bottom-16 right-0 w-64 bg-black/90 backdrop-blur-md rounded-lg shadow-xl p-3 text-white text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Connection Speed:</span>
                    <span className="ml-2">{formatBandwidth(bandwidth)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Current Quality:</span>
                    <span className="ml-2">{actualQuality?.name || "Unknown"}</span>
                    {selectedQuality === "auto" && <span className="text-xs ml-1">(Auto)</span>}
                  </div>
                  {hlsStats && (
                    <>
                      <div className="mb-2">
                        <span className="font-medium">Buffer Length:</span>
                        <span className="ml-2">{hlsStats.bufferLength.toFixed(1)}s</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Dropped Frames:</span>
                        <span className="ml-2">{hlsStats.droppedFrames}</span>
                      </div>
                      <div>
                        <span className="font-medium">Quality Changes:</span>
                        <span className="ml-2">{recentQualityChanges.length} in last 60s</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
