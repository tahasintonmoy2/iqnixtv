"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Volume2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AudioTrack = {
  id: number;
  name: string;
  isDefault: boolean;
  isActive: boolean;
};

type AudioTrackSelectorProps = {
  tracks: AudioTrack[];
  activeTrackId: number;
  onTrackChange: (trackId: number) => void;
  className?: string;
  showInControls?: boolean;
};

export function AudioTrackSelector({
  tracks,
  activeTrackId,
  onTrackChange,
  className = "",
  showInControls = false,
}: AudioTrackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentlyChanged, setRecentlyChanged] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTrack =
    tracks.find((track) => track.id === activeTrackId) || tracks[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTrackSelect = (trackId: number) => {
    onTrackChange(trackId);
    setIsOpen(false);
    setRecentlyChanged(true);

    // Reset the recently changed indicator after 3 seconds
    setTimeout(() => {
      setRecentlyChanged(false);
    }, 3000);
  };

  if (tracks.length <= 1) {
    return null; // Don't show selector if there's only one track
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <Button
        variant="ghost"
        size={showInControls ? "icon" : "sm"}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${showInControls ? "text-white hover:bg-white/10 h-10 w-10" : "text-white hover:bg-white/20 gap-2 px-3 py-2"}
          ${recentlyChanged ? "ring-2 ring-primary/50" : ""}
          transition-all duration-200
        `}
        title="Select Audio Track"
      >
        <Volume2 className="size-5" />
        {!showInControls && (
          <>
            <span className="inline text-sm">{activeTrack.name}</span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )}
            />
          </>
        )}
        <span className="sr-only">Select Audio Track</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 mt-2 w-72 bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden",
              showInControls ? "bottom-full mb-2 right-0" : "top-full"
            )}
          >
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-medium text-sm">Audio Tracks</h3>
              <p className="text-white/60 text-xs mt-1">
                Select your preferred audio track
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {tracks.map((track, index) => (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTrackSelect(track.id)}
                  className={cn(
                    "w-full group px-4 py-3 text-left transition-colors duration-150",
                    track.id === activeTrackId
                      ? "bg-primary/20 border-l-2 border-primary"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {track.name}
                          </span>
                          {track.isDefault && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {track.id === activeTrackId && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-white/50 text-xs">
                Audio tracks will switch seamlessly during playback
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active track indicator (mobile) */}
      {recentlyChanged && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-primary/90 text-white text-xs px-3 py-2 rounded-full whitespace-nowrap z-40"
        >
          Switched to {activeTrack.name}
        </motion.div>
      )}
    </div>
  );
}
