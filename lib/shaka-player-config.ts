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

    // Small delay to ensure DOM is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Install polyfills
    shaka.polyfill.installAll();

    // Reset video element state to ensure MediaSource is open/fresh
    videoElement.removeAttribute("src");
    videoElement.load();

    // Create player instance
    const player = new shaka.Player(videoElement);

    // Configure player for optimal streaming with ABR
    player.configure({
      streaming: {
        // Adaptive bitrate streaming configuration
        bufferingGoal: 30, // Increased to 30s (was 15s) for robust buffering
        rebufferingGoal: 2,
        bufferBehind: 60, // Keep more buffer behind (was 30) for seeking back without re-downloading
        // Don't force video to rebuffer on quality change
        alwaysStreamText: true,
        // More aggressive retry configuration for segments
        retryParameters: {
          maxAttempts: 5, // Increased from 3
          baseDelay: 300, // Reduced for faster retry
          backoffFactor: 1.5, // Less aggressive backoff
          fuzzFactor: 0.3,
          timeout: 15000, // Increased timeout
        },
        // Prevent unnecessary quality switches
        ignoreTextStreamFailures: true,
        useNativeHlsForFairPlay: true,
      },
      manifest: {
        retryParameters: {
          maxAttempts: 5, // Increased from 3
          baseDelay: 300,
          backoffFactor: 1.5,
          fuzzFactor: 0.3,
          timeout: 15000,
        },
        defaultPresentationDelay: 10,
      },
      drm: {
        servers: {},
        retryParameters: {
          maxAttempts: 5,
          baseDelay: 300,
          backoffFactor: 1.5,
          fuzzFactor: 0.3,
          timeout: 15000,
        },
      },
      abr: {
        enabled: true, // Enable adaptive bitrate
        defaultBandwidthEstimate: 1500000, // Start with 1.5 Mbps estimate (more conservative)
        switchInterval: 5, // Time between quality switches (seconds) - reduced for responsiveness
        bandwidthUpgradeTarget: 0.85, // Buffer fullness needed to upgrade
        bandwidthDowngradeTarget: 0.95, // Buffer fullness to trigger downgrade
        restrictions: {
          minWidth: 0,
          maxWidth: Infinity,
          minHeight: 0,
          maxHeight: Infinity,
          minPixels: 0,
          maxPixels: Infinity,
          minFrameRate: 0,
          maxFrameRate: Infinity,
          minBandwidth: 0,
          maxBandwidth: Infinity,
        },
        // Advanced ABR settings to prevent unnecessary switches
        advanced: {
          minTotalBytes: 128e3, // Minimum bytes before considering quality change
          minBytes: 16e3, // Minimum segment size
          fastHalfLife: 2, // Fast bandwidth estimation
          slowHalfLife: 5, // Slow bandwidth estimation
        },
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

    // Apply custom CSS for subtitle positioning (only once)
    if (!document.getElementById("shaka-subtitle-style")) {
      const style = document.createElement("style");
      style.id = "shaka-subtitle-style";
      style.textContent = `
        .shaka-text-container {
          bottom: 50px !important;
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          z-index: 1 !important;
          font-size: 26px !important;
          padding-inline: 26px !important;
        }

        .shaka-text-container > * {
          margin-bottom: 24px !important;
        }
        .shaka-text-container > div > span {
          padding-inline: 0.4rem !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Error handling
    player.addEventListener("error", (event) => {
      const error = event.detail;
      console.error("Shaka Player error event:", {
        code: error?.code,
      });
    });

    // Log quality changes for debugging
    player.addEventListener("variantchanged", () => {
      const tracks = player.getVariantTracks();
      const activeTrack = tracks.find((t) => t.active);
      if (activeTrack && activeTrack.height) {
        const bandwidth = activeTrack.bandwidth || 0;
        console.log(
          `Quality changed to: ${activeTrack.height}p @ ${Math.round(bandwidth / 1000)}kbps`
        );
      }
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
        `Failed to load manifest url. Ensure the playback ID is valid and the video is accessible.`
      );
    }

    return player;
  } catch (error) {
    console.error("Shaka Player initialization error:", error);
    throw error;
  }
}

export function configureShakaPlayerQuality(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  player: shaka.Player,
  qualityLevel?: number
) {
  const config = player.getConfiguration();

  if (qualityLevel !== undefined) {
    // Lock to specific quality without clearing buffer
    config.abr.enabled = false;
    player.configure(config);

    const tracks = player.getVariantTracks();
    if (tracks[qualityLevel]) {
      // Use clearBuffer=false for smooth transition
      player.selectVariantTrack(tracks[qualityLevel], false);
    }
  } else {
    // Enable adaptive bitrate
    config.abr.enabled = true;
    player.configure(config);
  }
}
