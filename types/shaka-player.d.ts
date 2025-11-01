interface Track {
  id: number;
  active: boolean;
  type: string;
  bandwidth?: number;
  language: string;
  label: string | null;
  kind: string | null;
  mimeType: string | null;
  primary: boolean;
  roles: string[];
  forced: boolean;
  originalTextId: string | null;
}

declare module "shaka-player/dist/shaka-player.compiled.js" {
  export interface ShakaErrorEvent {
    detail?: { code?: number };
  }

  export interface ShakaPlayer {
    load(uri: string): Promise<void>;
    configure(config: unknown): void;
    getVariantTracks(): Track[];
    selectVariantTrack(track: Track, clearBuffer?: boolean): void;
    addEventListener(
      type: string,
      listener: (event: ShakaErrorEvent) => void
    ): void;
    removeEventListener(
      type: string,
      listener: (event: ShakaErrorEvent) => void
    ): void;
    destroy(): Promise<void> | void;
  }

  const shaka: {
    Player: {
      new (video: HTMLVideoElement | null): ShakaPlayer;
      isBrowserSupported(): boolean;
    };
    polyfill: { installAll(): void };
    text: {
      UITextDisplayer: {
        new (video: HTMLVideoElement, container: HTMLElement): unknown;
      };
    };
  };

  export default shaka;
}
