"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import { formatDuration } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type EpisodeSliderProps = {
  series: Series & {
    seasons: Season[];
    episodes: (Episode & {
      thumbnailUrl?: string;
      duration?: number;
    })[];
  };
};

export function EpisodeSlider({ series }: EpisodeSliderProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("episode-container");
    if (!container) return;

    const scrollAmount = 320; // Approximate width of an episode card
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      setScrollPosition(newPosition);
      container.scrollTo({ left: newPosition, behavior: "smooth" });
    } else {
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      setScrollPosition(newPosition);
      container.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      {series.episodes.length > 1 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => scroll("left")}
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Scroll left</span>
          </Button>
        </div>
      )}

      {series.episodes.length === 0 ? (
        <div>There is no episode in this series</div>
      ) : (
        <div
          id="episode-container"
          className="flex overflow-hidden scrollbar-hide gap-4 py-4 px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {series?.episodes?.map((episode) => (
            <Link
              key={episode.id}
              href={`/play/${episode?.seasonId}/${episode.id}`}
              className="flex-shrink-0 w-[300px]"
            >
              <Card className="overflow-hidden border-0 gap-2 bg-transparent">
                <div className="relative">
                  <Image
                    src={episode.thumbnailUrl || "/placeholder.svg"}
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

      {series.episodes.length > 1 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      )}

      <style jsx>{`
        #episode-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
