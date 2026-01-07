// drm.config.ts
// Full DRM config for: Widevine + PlayReady + FairPlay
// Works with Mux/Custom Shaka integrations

export interface DRMConfigOptions {
  widevineLicenseUrl: string;
  playreadyLicenseUrl: string;
  fairplayCertificateUrl: string;
  fairplayLicenseUrl: string;

  // Optional: custom request headers
  headers?: Record<string, string>;
}

export function buildDRMConfig(opts: DRMConfigOptions) {
  return {
    drm: {
      servers: {
        "com.widevine.alpha": opts.widevineLicenseUrl,
        "com.microsoft.playready": opts.playreadyLicenseUrl,
        "com.apple.fps.1_0": opts.fairplayLicenseUrl,
      },

      advanced: {
        "com.widevine.alpha": {
          distinctiveIdentifierRequired: false,
          persistentStateRequired: false,
          videoRobustness: "SW_SECURE_CRYPTO",
          audioRobustness: "SW_SECURE_CRYPTO",
        },
        "com.microsoft.playready": {
          persistentStateRequired: false,
        },
        "com.apple.fps.1_0": {
          persistentStateRequired: false,
        },
      },

      // All DRM key requests funnel through this hook
      getLicense: async (body: null, licenseServerUrl: string) => {
        const response = await fetch(licenseServerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            ...(opts.headers || {}),
          },
          body,
        });

        if (!response.ok) {
          console.error("DRM License Error", await response.text());
          throw new Error("License request failed");
        }

        return await response.arrayBuffer();
      },

      // Apple FairPlay special handling
      initDataTransform: (initData, initDataType, drmInfo) => {
        if (initDataType === "skd" || drmInfo.keySystem === "com.apple.fps.1_0") {
          return transformFairPlayInitData(initData);
        }
        return initData;
      },
    },

    // FairPlay certificate (required on Safari)
    fairPlay: {
      certificateUrl: opts.fairplayCertificateUrl,
    },
  };
}

// FairPlay initData transformation for Safari HLS
function transformFairPlayInitData(initData: ArrayBuffer): ArrayBuffer {
  const stringData = new TextDecoder().decode(initData);
  const skdUri = stringData.replace("skd://", "");
  return new TextEncoder().encode(skdUri).buffer;
}
