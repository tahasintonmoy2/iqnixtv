"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/video-player-utils";
import {
    Maximize,
    Minimize,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ProgressPreview } from "./progress-preview";

export interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  thumbnailImageUrl: string;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onPlaybackRateChange: (rate: number) => void;
  title?: string;
}

/**
 * Custom Player Controls Component
 * Provides accessible, responsive controls for video playback
 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  thumbnailImageUrl,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  title,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls on mouse inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-between group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowVolumeSlider(false);
      }}
    >
      {/* Title Bar */}
      {title && (
        <div
          className={cn(
            "px-4 py-3 bg-linear-to-b from-black/60 to-transparent",
            "transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h2 className="text-white text-sm font-medium truncate">{title}</h2>
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          "absolute bottom-16 left-0 right-0 px-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <ProgressPreview
          duration={duration}
          currentTime={currentTime}
          thumbnailImageUrl={thumbnailImageUrl}
          onSeek={onSeek}
        />
      </div>

      {/* Control Bar */}
      <div
        className={cn(
          "px-4 py-3 bg-linear-to-t from-black/80 to-transparent",
          "flex items-center justify-between gap-2",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Volume Control */}
          <div className="relative group/volume">
            <button
              onClick={onToggleMute}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
              onMouseEnter={() => setShowVolumeSlider(true)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3.5 bg-black/80 rounded-lg"
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-1 h-24 appearance-none bg-white/20 rounded-full cursor-pointer accent-red-500"
                  style={{
                    writingMode: "vertical-lr",
                  }}
                  aria-label="Volume"
                />
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="text-white text-xs font-mono ml-2 min-w-fit">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 opacity-50">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={onFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
