export interface MuxVideoConfig {
  playbackId: string
  token?: string
  policies?: {
    drm?: boolean
    watermark?: boolean
  }
}

export interface MuxAnalyticsConfig {
  envKey: string
  videoId?: string
  videoTitle?: string
  viewerId?: string
}

/**
 * Generate HLS URL from Mux playback ID
 * Supports both signed and unsigned URLs
 */
export function generateMuxHlsUrl(config: MuxVideoConfig): string {
  const baseUrl = "https://stream.mux.com"
  const { playbackId, token } = config

  if (!playbackId) {
    throw new Error("Mux playback ID is required")
  }

  // Unsigned URL (public videos)
  if (!token) {
    return `${baseUrl}/${playbackId}.m3u8`
  }

  // Signed URL (protected videos)
  return `${baseUrl}/${playbackId}.m3u8?token=${token}`
}

/**
 * Initialize Mux analytics
 * Tracks video engagement and performance metrics
 */
// export function initializeMuxAnalytics(config: MuxAnalyticsConfig) {
//   if (typeof window === "undefined") return

//   // Load Mux data script
//   const script = document.createElement("script")
//   script.src = "https://cdn.mux.com/mux-data.js"
//   script.async = true
//   document.head.appendChild(script)

//   script.onload = () => {
//     if (window.muxAnalytics) {
//       window.muxAnalytics.monitor({
//         envKey: config.envKey,
//         videoId: config.videoId || "unknown",
//         videoTitle: config.videoTitle || "Untitled",
//         viewerId: config.viewerId,
//       })
//     }
//   }
// }
