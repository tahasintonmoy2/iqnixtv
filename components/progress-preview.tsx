"use client";

import type React from "react";
import { useState, useRef } from "react";

export interface ProgressPreviewProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  thumbnailUrl?: string;
}

/**
 * Progress Preview Component
 * Shows preview tooltip when hovering over progress bar
 */
export const ProgressPreview: React.FC<ProgressPreviewProps> = ({
  duration,
  currentTime,
  onSeek,
  thumbnailUrl,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    setPreviewTime(time);
    setPreviewPosition(percent * 100);
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = String(minutes).padStart(2, "0");
    const paddedSecs = String(secs).padStart(2, "0");

    if (hours > 0) {
      const paddedHours = String(hours).padStart(2, "0");
      return `${paddedHours}:${paddedMins}:${paddedSecs}`;
    }

    return `${minutes}:${paddedSecs}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="slider"
      aria-label="Video progress"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      tabIndex={0}
    >
      {/* Progress Fill */}
      <div
        className="h-full bg-red-500 rounded-full transition-all"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />

      {/* Buffered Progress */}
      <div className="absolute h-full bg-white/30 rounded-full w-1/3" />

      {/* Scrubber */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />

      {/* Preview Tooltip */}
      {showPreview && (
        <div
          className="absolute bottom-full mb-2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-white text-xs whitespace-nowrap pointer-events-none"
          style={{ left: `${previewPosition}%` }}
        >
          {thumbnailUrl && (
            <div className="mt-1 w-24 h-14 bg-gray-700 rounded overflow-hidden">
              <img
                src={thumbnailUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {formatTime(previewTime)}
        </div>
      )}
    </div>
  );
};
