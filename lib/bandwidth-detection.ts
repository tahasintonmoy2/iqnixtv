export const QUALITY_LEVELS = {
  "360p": 800, // 800 Kbps
  "480p": 1400, // 1.4 Mbps
  "720p": 2500, // 2.5 Mbps
  "1080p": 5000, // 5 Mbps
  auto: 0, // Special case, handled separately
}

export type VideoQuality = keyof typeof QUALITY_LEVELS

// Size of the test file to download (in bytes)
// Reduced from 2MB to 1MB to prevent memory issues
const TEST_FILE_SIZE = 1 * 1024 * 1024 // 1MB

/**
 * Detects the current bandwidth by downloading a test file
 * @returns Promise that resolves to the bandwidth in Kbps
 */
export async function detectBandwidth(): Promise<number> {
  try {
    // Try to use the Network Information API if available
    if ("connection" in navigator && navigator.connection && "downlink" in (navigator.connection as any)) {
      const connection = navigator.connection as any
      if (connection.downlink > 0) {
        // downlink is in Mbps, convert to Kbps
        return connection.downlink * 1000
      }
    }

    // Fallback: Measure download speed by fetching a test file
    const startTime = Date.now()

    // Use a random parameter to prevent caching
    const testUrl = `/api/bandwidth-test?cache=${Date.now()}`

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(testUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to fetch test file")
    }

    // Read the response as an array buffer with error handling
    try {
      const arrayBuffer = await response.arrayBuffer()
      
      // Verify the buffer size to prevent memory issues
      if (arrayBuffer.byteLength !== TEST_FILE_SIZE) {
        console.warn("Unexpected test file size:", arrayBuffer.byteLength)
      }
    } catch (bufferError) {
      console.error("Error reading array buffer:", bufferError)
      throw new Error("Failed to read test file data")
    }

    const endTime = Date.now()
    const durationSeconds = (endTime - startTime) / 1000

    // Calculate bandwidth in Kbps (kilobits per second)
    // TEST_FILE_SIZE is in bytes, so multiply by 8 to get bits, then divide by 1000 for Kbps
    const bandwidthKbps = (TEST_FILE_SIZE * 8) / (durationSeconds * 1000)

    return bandwidthKbps
  } catch (error) {
    console.error("Error detecting bandwidth:", error)
    // Return a conservative estimate if detection fails
    return 2000 // Assume 2 Mbps
  }
}

/**
 * Determines the optimal video quality based on the detected bandwidth
 * @param bandwidthKbps The detected bandwidth in Kbps
 * @returns The recommended video quality
 */
export function getOptimalQuality(bandwidthKbps: number): VideoQuality {
  // Apply a safety factor to account for bandwidth fluctuations
  const adjustedBandwidth = bandwidthKbps * 0.7

  if (adjustedBandwidth >= QUALITY_LEVELS["1080p"]) {
    return "1080p"
  } else if (adjustedBandwidth >= QUALITY_LEVELS["720p"]) {
    return "720p"
  } else if (adjustedBandwidth >= QUALITY_LEVELS["480p"]) {
    return "480p"
  } else {
    return "360p"
  }
}

/**
 * Formats bandwidth for display
 * @param bandwidthKbps Bandwidth in Kbps
 * @returns Formatted string (e.g., "5.2 Mbps")
 */
export function formatBandwidth(bandwidthKbps: number): string {
  if (bandwidthKbps >= 1000) {
    return `${(bandwidthKbps / 1000).toFixed(1)} Mbps`
  } else {
    return `${Math.round(bandwidthKbps)} Kbps`
  }
}
