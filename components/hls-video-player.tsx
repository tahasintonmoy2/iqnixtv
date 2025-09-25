"use client"

import { useState, useRef, useEffect } from "react"
import { HlsManager, type HlsQualityLevel, type HlsStats, type StabilityConfig } from "@/lib/hls-manager"
import Hls from "hls.js"

type HlsVideoPlayerProps = {
  src: string
  poster?: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
  stabilityConfig?: Partial<StabilityConfig>
  onPlayerReady?: (videoElement: HTMLVideoElement) => void
  onQualityChange?: (quality: HlsQualityLevel) => void
  onQualityLevelsLoaded?: (levels: HlsQualityLevel[]) => void
  onStatsUpdate?: (stats: HlsStats) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onError?: (error: any) => void
  onVideoClick?: () => void
}

export function HlsVideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = false,
  className = "",
  stabilityConfig,
  onPlayerReady,
  onQualityChange,
  onQualityLevelsLoaded,
  onStatsUpdate,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  onVideoClick,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsManagerRef = useRef<HlsManager | null>(null)
  const [isHlsSupported, setIsHlsSupported] = useState(false)

  // Initialize HLS on mount
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Check if HLS is supported
    const isSupported = Hls.isSupported()
    setIsHlsSupported(isSupported)

    if (isSupported) {
      // Create HLS manager with stability config
      hlsManagerRef.current = new HlsManager(stabilityConfig)

      // Set up callbacks
      if (onQualityChange) {
        hlsManagerRef.current.onLevelSwitching(onQualityChange)
      }

      if (onQualityLevelsLoaded) {
        hlsManagerRef.current.onLevelsLoaded(onQualityLevelsLoaded)
      }

      if (onStatsUpdate) {
        hlsManagerRef.current.onStatsUpdate(onStatsUpdate)
      }

      // Initialize HLS with the video element and source
      hlsManagerRef.current.initialize(videoElement, src)

      // Notify that player is ready
      if (onPlayerReady) {
        onPlayerReady(videoElement)
      }
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari, which has native HLS support
      videoElement.src = src

      // Notify that player is ready
      if (onPlayerReady) {
        onPlayerReady(videoElement)
      }
    } else {
      console.error("HLS is not supported in this browser and no fallback is available")
      if (onError) {
        onError(new Error("HLS not supported"))
      }
    }

    // Clean up on unmount
    return () => {
      if (hlsManagerRef.current) {
        hlsManagerRef.current.dispose()
        hlsManagerRef.current = null
      }
    }
  }, [src, onPlayerReady, onQualityChange, onQualityLevelsLoaded, onStatsUpdate, onError, stabilityConfig])

  // Set up video event listeners
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handlePlay = () => {
      if (onPlay) onPlay()
    }

    const handlePause = () => {
      if (onPause) onPause()
    }

    const handleEnded = () => {
      if (onEnded) onEnded()
    }

    const handleTimeUpdate = () => {
      if (onTimeUpdate) onTimeUpdate(videoElement.currentTime, videoElement.duration)
    }

    const handleError = (e) => {
      if (onError) onError(e)
    }

    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("ended", handleEnded)
    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("error", handleError)

    return () => {
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("ended", handleEnded)
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("error", handleError)
    }
  }, [onPlay, onPause, onEnded, onTimeUpdate, onError])

  // Method to set quality level
  const setQuality = (levelId: number) => {
    if (hlsManagerRef.current) {
      hlsManagerRef.current.setQuality(levelId)
    }
  }

  // Method to update stability config
  const updateStabilityConfig = (config: Partial<StabilityConfig>) => {
    if (hlsManagerRef.current) {
      hlsManagerRef.current.updateStabilityConfig(config)
    }
  }

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      playsInline
      onClick={onVideoClick}
    >
      {/* Fallback for browsers that don't support HLS */}
      {!isHlsSupported && <source src={src} type="application/x-mpegURL" />}
      Your browser does not support the video tag.
    </video>
  )
}
