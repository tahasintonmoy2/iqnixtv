declare module "shaka-player/dist/shaka-player.compiled.js" {
  interface ShakaErrorEvent {
    detail?: { code?: number };
  }

  interface ShakaPlayer {
    load(uri: string): Promise<void>;
    configure(config: unknown): void;
    addEventListener(
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
  };

  export default shaka;
}
