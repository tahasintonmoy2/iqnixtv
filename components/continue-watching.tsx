"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { Episode, Season, Series, WatchHistory } from "@/lib/generated/prisma";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ContinueWatchingProps {
  episodes: (Episode & {
    thumbnailImageUrl?: string;
    duration?: number;
    seasonId: string;
  })[];
  seriesId: string;
  seasonId: string;
  episodeId: string;
}

export function ContinueWatching({
  seriesId,
  seasonId,
  episodeId,
}: ContinueWatchingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {user} = useAuth();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [history, setHistory] = useState<
    (WatchHistory & { episode: Episode & { season: Season }; series: Series })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `/api/series/${seriesId}/season/${seasonId}/episode/${episodeId}/watch-history`
        );

        const data = response.data;
        setHistory(data);
      } catch (error) {
        console.log(error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, seriesId, seasonId, episodeId]);

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 contin-watch-mobn">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-lg mb-3 bg-muted"></div>
              <div className="h-4 rounded mb-2 bg-muted"></div>
              <div className="h-3 rounded bg-muted"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 contin-watch">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-lg mb-3 bg-muted"></div>
              <div className="h-4 rounded mb-2 bg-muted"></div>
              <div className="h-3 rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex max-w-96 items-center font-medium p-2 border text-red-600 border-red-500 bg-red-800/35 rounded-sm">
        <ExclamationTriangleIcon className="mr-2 size-5" />
        <p>Failed to load your watch history.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center w-full">
        <p className="text-muted-foreground bg-background lg:rounded-t-lg rounded-lg py-4">
          Please sign in to view your watch history.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="bg-background lg:rounded-t-lg rounded-lg py-4">
          No watching history yet. Start watching some videos!
        </p>
      </div>
    );
  }

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    // Responsive scroll amount based on screen size
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    const scrollAmount = isMobile ? 200 : isTablet ? 250 : 300;
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
    <div className="w-full">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-foreground">
        Continue Watching
      </h2>

      <div className="relative group">
        {/* Left navigation button */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {history.length > 2 && scrollPosition > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-sm border"
              onClick={() => scroll("left")}
              aria-label="Scroll continue watching left"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
          )}
        </div>

        {/* Content container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide gap-3 sm:gap-4 py-2 sm:py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="region"
          aria-label="Continue watching content"
        >
          {history.map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-48 sm:w-56 md:w-64 lg:w-72"
            >
              <Card className="overflow-hidden bg-transparent border-0 group/card gap-0">
                <div className="relative aspect-video overflow-hidden rounded-md">
                  <Link
                    href={`/play/${item.episode.seasonId}/${item.episodeId}?t=${item.currentTime}`}
                    className="block w-full h-full"
                  >
                    <Image
                      src={item.series.thumbnailImageUrl || "/placeholder.svg"}
                      alt={item.series.name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/60">
                      <Button
                        size="icon"
                        className="size-10 sm:size-12 rounded-full bg-white/20 hover:bg-white/30"
                      >
                        <Play className="size-4 sm:size-6 fill-white" />
                        <span className="sr-only">Resume playing</span>
                      </Button>
                    </div>
                  </Link>
                  <Progress
                    value={item.progressPercent}
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-none bg-white/20"
                  />
                </div>
                <CardContent className="p-2 sm:p-3">
                  <h3 className="font-semibold text-sm sm:text-base truncate line-clamp-2 text-foreground mb-1">
                    {item.series.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <span>S{item.episode.season?.seasonNumber}</span>
                    <span>•</span>
                    <span>EP {item.episode.episodeNumber}</span>
                    <span>•</span>
                    <span className="truncate">
                      {formatDistanceToNow(item.lastWatchedAt)} ago
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Right navigation button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {history.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-sm border"
              onClick={() => scroll("right")}
              aria-label="Scroll continue watching right"
            >
              <ChevronRight className="size-4 sm:size-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
