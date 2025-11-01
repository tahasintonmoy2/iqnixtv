"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
  className,
}: AudioTrackSelectorProps) {
  const [recentlyChanged, setRecentlyChanged] = useState(false);

  const activeTrack =
    tracks.find((track) => track.id === activeTrackId) || tracks[0];

  const handleTrackSelect = (trackId: number) => {
    onTrackChange(trackId);
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
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-visible:ring-transparent focus:outline-none">
          <Button variant="outline" size="sm" title="Select Audio Track">
            <span className="inline text-sm">{activeTrack.name}</span>
            <ChevronDown className="size-4 transition-transform text-muted-foreground" />

            <span className="sr-only">Select Audio Track</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="focus-visible:ring-transparent focus:outline-none"
        >
          {tracks.map((trk) => (
            <DropdownMenuItem
              key={trk.id}
              className={cn(
                "w-full group px-2 py-2 text-left transition-colors duration-150 my-1 cursor-pointer",
                trk.id === activeTrackId
                  ? "bg-secondary hover:!bg-secondary border-scbg-secondary"
                  : "hover:bg-white/10",
              )}
              onClick={() => handleTrackSelect(trk.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        {trk.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
