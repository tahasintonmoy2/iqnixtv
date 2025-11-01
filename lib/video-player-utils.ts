export interface VideoQuality {
  height: number
  bitrate: number
  label: string
}

export const QUALITY_LEVELS: VideoQuality[] = [
  { height: 2160, bitrate: 15000, label: "4K" },
  { height: 1440, bitrate: 8000, label: "1440p" },
  { height: 1080, bitrate: 5000, label: "1080p" },
  { height: 720, bitrate: 2500, label: "720p" },
  { height: 480, bitrate: 1000, label: "480p" },
  { height: 360, bitrate: 500, label: "360p" },
]

/**
 * Format time in seconds to HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const paddedMins = String(minutes).padStart(2, "0")
  const paddedSecs = String(secs).padStart(2, "0")

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, "0")
    return `${paddedHours}:${paddedMins}:${paddedSecs}`
  }

  return `${minutes}:${paddedSecs}`
}

/**
 * Detect recommended quality based on viewport and connection
 */
export function detectRecommendedQuality(
  viewportWidth: number,
  connection?: "slow-2g" | "2g" | "3g" | "4g",
): VideoQuality {
  // Connection-based recommendation
  if (connection === "slow-2g" || connection === "2g") {
    return QUALITY_LEVELS[QUALITY_LEVELS.length - 1] // Lowest quality
  }

  if (connection === "3g") {
    return QUALITY_LEVELS[4] // 480p
  }

  // Viewport-based recommendation
  if (viewportWidth >= 1920) return QUALITY_LEVELS[0] // 4K
  if (viewportWidth >= 1440) return QUALITY_LEVELS[1] // 1440p
  if (viewportWidth >= 1080) return QUALITY_LEVELS[2] // 1080p
  if (viewportWidth >= 720) return QUALITY_LEVELS[3] // 720p
  if (viewportWidth >= 480) return QUALITY_LEVELS[4] // 480p

  return QUALITY_LEVELS[5] // 360p
}

/**
 * Video player error types and messages
 */
export enum VideoErrorType {
  NETWORK = "NETWORK_ERROR",
  PLAYBACK = "PLAYBACK_ERROR",
  UNSUPPORTED = "UNSUPPORTED_FORMAT",
  TIMEOUT = "TIMEOUT_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface VideoError {
  type: VideoErrorType
  message: string
  code?: number
  originalError?: Error
}

export function parseVideoError(error: any): VideoError {
  if (!error) {
    return {
      type: VideoErrorType.UNKNOWN,
      message: "An unknown error occurred",
    }
  }

  // Network errors
  if (error.code === 4 || error.message?.includes("network")) {
    return {
      type: VideoErrorType.NETWORK,
      message: "Network error. Please check your connection.",
      code: error.code,
      originalError: error,
    }
  }

  // Unsupported format
  if (error.code === 4 || error.message?.includes("format")) {
    return {
      type: VideoErrorType.UNSUPPORTED,
      message: "Video format is not supported by your browser.",
      code: error.code,
      originalError: error,
    }
  }

  // Timeout
  if (error.message?.includes("timeout")) {
    return {
      type: VideoErrorType.TIMEOUT,
      message: "Video loading timed out. Please try again.",
      originalError: error,
    }
  }

  // Generic playback error
  return {
    type: VideoErrorType.PLAYBACK,
    message: error.message || "Playback error occurred",
    code: error.code,
    originalError: error,
  }
}
