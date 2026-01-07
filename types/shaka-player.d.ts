/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Additional type definitions for Shaka Player to fix TypeScript errors
 * Add this file to your types folder (e.g., types/shaka-player.d.ts)
 */

declare module "shaka-player/dist/shaka-player.compiled.js" {
  export namespace shaka {
    export namespace extern {
      interface Track {
        id?: number;
        active?: boolean;
        type?: string;
        bandwidth?: number;
        language?: string;
        label?: string | null;
        kind?: string | null;
        width?: number;
        height?: number;
        frameRate?: number;
        pixelAspectRatio?: string;
        mimeType?: string | null;
        codecs?: string;
        audioCodec?: string;
        videoCodec?: string;
        primary?: boolean;
        roles?: string[];
        audioRoles?: string[];
        forced?: boolean;
        videoId?: number | null;
        audioId?: number | null;
        channelsCount?: number | null;
        audioSamplingRate?: number | null;
        tilesLayout?: string;
        audioBandwidth?: number;
        videoBandwidth?: number;
        originalVideoId?: string | null;
        originalAudioId?: string | null;
        originalTextId?: string | null;
        originalLanguage?: string;
      }

      interface TextTrack extends Track {
        originalLanguage?: string;
      }

      interface VariantTrack extends Track {
        videoId?: number;
        audioId?: number;
      }

      interface AbrManager {
        init(
          switchCallback: (
            variant: Track,
            clearBuffer: boolean,
            safeMargin?: number
          ) => void
        ): void;
        stop(): void;
        release(): void;
        enable(): void;
        disable(): void;
        segmentDownloaded(
          deltaTimeMs: number,
          numBytes: number,
          allowSwitch?: boolean,
          request?: any
        ): void;
        getBandwidthEstimate(): number;
        setVariants(variants: Track[]): boolean;
        configure(config: any): void;
        chooseVariant(preferFastSwitching?: boolean): Track | null;
        playbackRateChanged(rate: number): void;
        setCmsdManager(manager: any): void;
        setMediaElement(element: HTMLMediaElement | null): void;
        trySuggestStreams(): boolean;
      }
    }

    export class Player {
      constructor(
        video?: HTMLVideoElement,
        dependencyInjector?: (player: Player) => void
      );

      static isBrowserSupported(): boolean;

      load(
        manifestUri: string,
        startTime?: number,
        mimeType?: string
      ): Promise<void>;
      unload(reinitializeMediaSource?: boolean): Promise<void>;
      destroy(): Promise<void>;

      configure(config: any): void;
      getConfiguration(): any;

      getVariantTracks(): extern.VariantTrack[];
      getTextTracks(): extern.TextTrack[];
      selectVariantTrack(
        track: extern.Track,
        clearBuffer?: boolean,
        safeMargin?: number
      ): void;
      selectTextTrack(track: extern.Track): void;
      setTextTrackVisibility(visible: boolean): void;
      isTextTrackVisible(): boolean;

      addEventListener(type: string, listener: (event: any) => void): void;
      removeEventListener(type: string, listener: (event: any) => void): void;
    }

    export namespace polyfill {
      export function installAll(): void;
    }

    export namespace text {
      export class UITextDisplayer {
        constructor(video: HTMLVideoElement, videoContainer: HTMLElement);
      }
    }

    export namespace util {
      export class Error {
        code?: number;
        message?: string;
        data?: any[];
      }
    }
  }

  const shaka: typeof import("shaka-player/dist/shaka-player.compiled.js").shaka;
  export default shaka;
}

// Extend the global shaka namespace if needed
declare global {
  const shaka: typeof import("shaka-player/dist/shaka-player.compiled.js").shaka;
}
