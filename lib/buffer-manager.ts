// Advanced buffering strategy manager for enterprise streaming
export interface BufferState {
  bufferedRanges: TimeRange[];
  bufferingProgress: number;
  isBuffering: boolean;
  estimatedBufferTime: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export class BufferManager {
  private videoElement: HTMLVideoElement;
  private bufferThreshold = 3; // seconds
  private maxBufferSize = 60; // seconds
  private onBufferingChange: ((isBuffering: boolean) => void) | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  getBufferState(): BufferState {
    const buffered = this.videoElement.buffered;
    const bufferedRanges: TimeRange[] = [];

    for (let i = 0; i < buffered.length; i++) {
      bufferedRanges.push({
        start: buffered.start(i),
        end: buffered.end(i),
      });
    }

    const currentTime = this.videoElement.currentTime;
    const bufferedAhead = this.getBufferedAhead(currentTime);
    const isBuffering =
      bufferedAhead < this.bufferThreshold && !this.videoElement.paused;

    return {
      bufferedRanges,
      bufferingProgress: (bufferedAhead / this.maxBufferSize) * 100,
      isBuffering,
      estimatedBufferTime: bufferedAhead,
    };
  }

  private getBufferedAhead(currentTime: number): number {
    const buffered = this.videoElement.buffered;

    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
        return buffered.end(i) - currentTime;
      }
    }

    return 0;
  }

  setOnBufferingChange(callback: (isBuffering: boolean) => void) {
    this.onBufferingChange = callback;
  }

  checkBufferingStatus() {
    const state = this.getBufferState();
    if (this.onBufferingChange) {
      this.onBufferingChange(state.isBuffering);
    }
  }

  getBufferVisualization(duration: number): number[] {
    const buffered = this.videoElement.buffered;
    const segments = 100;
    const visualization: number[] = new Array(segments).fill(0);

    for (let i = 0; i < buffered.length; i++) {
      const start = Math.floor((buffered.start(i) / duration) * segments);
      const end = Math.ceil((buffered.end(i) / duration) * segments);

      for (let j = start; j < end && j < segments; j++) {
        visualization[j] = 1;
      }
    }

    return visualization;
  }
}
