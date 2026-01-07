"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Episode } from "@/lib/generated/prisma";
import Image from "next/image";
import React from "react";
import { FaPlay } from "react-icons/fa6";
import { Badge } from "./ui/badge";

interface NextEpisodePreviewCardProps {
  children: React.ReactNode;
  episode?: Episode;
  seasonNumber: string | undefined;
  thumbnail?: string | null;
  disabled?: boolean;
}

export const NextEpisodePreviewCard = ({
  children,
  episode,
  thumbnail,
  seasonNumber,
  disabled = false,
}: NextEpisodePreviewCardProps) => {

  if (disabled || !episode) return <>{children}</>;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-80 h-[5.6rem] p-0 overflow-hidden bg-black/40 backdrop-blur-sm transition-colors ml-8 mb-4"
        align="end"
        sideOffset={20}
      >
        <div className="flex">
          {/* Thumbnail Section */}
          <div className="relative">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={episode.name}
                width={128}
                height={96}
                className="object-cover w-32 h-24 opacity-80"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                <FaPlay className="size-8 text-white/20" />
              </div>
            )}
          </div>

          {/* Shortcuts Hint */}
          <div className="px-3 py-1 border-t border-white/5 flex flex-col items-start">
            <div className="flex flex-col">
              <span className="text-[12px] mb-0.5 block uppercase tracking-wider">
                Next
              </span>
              <h4 className="text-sm text-white line-clamp-2">
               EP{episode.episodeNumber}: {episode.name}
              </h4>
              <p className="text-xs text-neutral-400">
                S{seasonNumber || "1"} EP{episode.episodeNumber || "1"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="uppercase">Shift + N</Badge>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
