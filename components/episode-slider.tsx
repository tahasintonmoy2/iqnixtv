"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import { formatDuration } from "@/lib/utils";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type EpisodeSliderProps = {
  series: Series & {
    seasons: Season[];
    episodes: (Episode & {
      thumbnailImageUrl?: string;
      duration?: number;
    })[];
  };
};

export function EpisodeSlider({ series }: EpisodeSliderProps) {
  return (
    <div className="relative">
      {series.episodes.length === 0 ? (
        <div>There is no episode in this series</div>
      ) : (
        <div
          className="flex overflow-hidden scrollbar-hide gap-4 py-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          {series?.episodes?.map((episode) => (
            <Link
              key={episode.id}
              href={`/play/${episode?.seasonId}/${episode.id}`}
              className="shrink-0 w-[300px]"
            >
              <Card className="overflow-hidden border-0 gap-2 bg-transparent">
                <div className="relative">
                  <Image
                    src={episode.thumbnailImageUrl || "/placeholder.svg"}
                    alt={episode.name}
                    width={300}
                    height={168}
                    className="object-cover w-full h-[185px] rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/60">
                    <Button
                      size="icon"
                      className="size-12 rounded-full bg-white/20 hover:bg-white/20"
                    >
                      <Play className="size-6 fill-white" />
                      <span className="sr-only">Resume playing</span>
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    {formatDuration(episode.duration || 0)}
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{episode.episodeNumber}.</span>
                    <h3 className="font-medium line-clamp-1">{episode.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {episode.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
