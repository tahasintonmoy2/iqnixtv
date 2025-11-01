"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRelatedContent } from "@/hooks/use-related-content";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

interface RelatedContentProps {
  seriesId: string;
  genre?: string[];
  initialContent?: {
    content: Series[];
    seasons: (Season & {
      episodes: Episode[];
    })[];
  };
}

export function RelatedContent({
  seriesId,
  genre,
  initialContent,
}: RelatedContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data, loading, error } = useRelatedContent(seriesId, genre, 10);

  // Use initial data or fetched data
  const content = data?.content || initialContent?.content || [];
  const seasons = data?.seasons || initialContent?.seasons || [];

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
        <AlertCircle className="mr-2 h-4 w-4" />
        Unable to load related content
      </div>
    );
  }

  if (loading && !initialContent) {
    return (
      <div className="grid grid-cols-3 gap-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-4 lg:w-[250px] w-24" />
          </div>
        ))}
      </div>
    );
  }

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 350; // Approximate width of a content card
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
      {content.length > 1 && (
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

      <div
        ref={containerRef}
        className="flex overflow-hidden scrollbar-hide gap-4 py-4 px-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
          overflow: "hidden",
        }}
      >
        {content.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-8 text-center">
            <div className="rounded-full bg-muted/30 p-4 mb-4">
              <TriangleAlert className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No related content found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find any similar content at the moment
            </p>
          </div>
        ) : (
          content.map((item) => {
            const relatedSeasons = seasons.filter(
              (s) => s.seriesId === item.id
            );
            const firstEpisode = relatedSeasons[0]?.episodes[0];

            return (
              <Link
                key={item.id}
                href={
                  item.type === "SERIES" || item.type === "MOVIE"
                    ? firstEpisode
                      ? `/play/${relatedSeasons[0].id}/${firstEpisode.id}`
                      : `/drama/${item.id}`
                    : `/movie/${item.id}`
                }
                className="flex-shrink-0 w-[140px] overflow-hidden"
              >
                <div className="gap-3 w-[140px]">
                  <div className="overflow-hidden relative rounded">
                    <Image
                      src={item.thumbnailImageUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={500}
                      height={185}
                      className="object-cover h-[185px] overflow-hidden transition-transform duration-200 hover:scale-105"
                    />
                  </div>
                  <div className="mt-2">
                    <h1>{item.name}</h1>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {content.length > 1 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => scroll("right")}
            disabled={
              scrollPosition >=
              (containerRef.current?.scrollWidth || 0) -
                (containerRef.current?.clientWidth || 0)
            }
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
