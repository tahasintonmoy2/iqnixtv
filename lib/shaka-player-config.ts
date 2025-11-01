// Shaka Player configuration for enterprise streaming
import shaka from "shaka-player/dist/shaka-player.compiled.js";

export interface ShakaPlayerConfig {
  autoplay?: boolean;
  preload?: string;
  controls?: boolean;
  width?: string;
  height?: string;
}

export async function initializeShakaPlayer(
  videoElement: HTMLVideoElement,
  manifestUrl: string
) {
  try {
    // Check browser support
    if (!shaka.Player.isBrowserSupported()) {
      console.error("Shaka Player not supported in this browser");
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Install polyfills
    shaka.polyfill.installAll();

    // Create player instance
    const player = new shaka.Player(videoElement);

    // Configure player for enterprise streaming
    player.configure({
      streaming: {
        // Adaptive bitrate streaming configuration
        bufferingGoal: 8,
        rebufferingGoal: 2,
        bufferBehind: 30,
        // Retry configuration for segments
        retryParameters: {
          maxAttempts: 3,
          baseDelay: 500,
          backoffFactor: 2,
          fuzzFactor: 0.5,
          timeout: 10000, // Reduced from 60s to 10s for faster failure detection
        },
      },
      manifest: {
        retryParameters: {
          maxAttempts: 3,
          baseDelay: 500,
          backoffFactor: 2,
          fuzzFactor: 0.5,
          timeout: 10000, // Reduced from 60s to 10s for faster manifest loading
        },
        defaultPresentationDelay: 10,
        // HLS configuration for better manifest parsing
      },
      drm: {
        servers: {},
      },
      abr: {
        enabled: true,
        defaultBandwidthEstimate: 2500000, // 2.5 Mbps default
        switchInterval: 8, // Switch quality every 8 seconds
        bandwidthUpgradeTarget: 0.85,
        bandwidthDowngradeTarget: 0.65,
      },
      textDisplayFactory: () => {
        return new shaka.text.UITextDisplayer(
          videoElement,
          videoElement.parentElement as HTMLElement
        );
      },
    });

    // Set subtitle styling with custom bottom position
    player.configure({
      textDisplayer: {
        captionsUpdatePeriod: 0.25,
      },
    });

    // Apply custom CSS for subtitle positioning
    const style = document.createElement("style");
    style.textContent = `
      .shaka-text-container {
        bottom: 50px !important;
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        z-index: 1 !important;
        font-size: 26px !important;
      }

      .shaka-text-container > * {
        margin-bottom: 20px !important;
      }
    `;
    document.head.appendChild(style);

    player.addEventListener("error", (event) => {
      const error = event.detail;
      console.error("Shaka Player error event:", {
        code: error?.code,
      });
    });

    // Load manifest with error handling
    console.log("Loading manifest:", manifestUrl);

    if (!manifestUrl || !manifestUrl.startsWith("http")) {
      throw new Error(`Invalid manifest URL: ${manifestUrl}`);
    }

    const resolvedUrl = manifestUrl.startsWith("http")
      ? manifestUrl
      : `https://stream.mux.com/${manifestUrl}.m3u8`;

    try {
      await player.load(resolvedUrl);
      console.log("Manifest loaded successfully");
    } catch (loadError) {
      console.log("Manifest load failed:", loadError);
      throw new Error(
        `Failed to load manifest url from ${manifestUrl}. Ensure the playback ID is valid and the video is accessible.`
      );
    }

    return player;
  } catch (error) {
    console.error("Shaka Player initialization error:", error);
    throw error;
  }
}

export function configureShakaPlayerQuality(
  player: shaka.Player,
  qualityLevel?: number
) {
  const config = player.getConfiguration();

  if (qualityLevel !== undefined) {
    // Lock to specific quality
    config.abr.enabled = false;
    player.configure(config);

    const tracks = player.getVariantTracks();
    if (tracks[qualityLevel]) {
      player.selectVariantTrack(tracks[qualityLevel]);
    }
  } else {
    // Enable adaptive bitrate
    config.abr.enabled = true;
    player.configure(config);
  }
}
