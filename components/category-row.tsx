"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContentRating, Episode, Series } from "@/lib/generated/prisma";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type CategoryRowProps = {
  title: string;
  content: (Series & { contentRating?: ContentRating | null, episode: Episode[] })[];
};

export function CategoryRow({
  title,
  content,
}: CategoryRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    // Responsive scroll amount based on screen size
    const isMobile = window.innerWidth < 640;
    const scrollAmount = isMobile ? 200 : 350; // Smaller scroll on mobile
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

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scroll("right");
    } else if (isRightSwipe) {
      scroll("left");
    }
  };

  // if (loading) {
  //   return (
  //     <div className="mb-8">
  //       <h2 className="text-2xl font-bold mb-4">{title}</h2>
  //       <div className="flex gap-4 py-4">
  //         {Array.from({ length: 5 }, (_, i) => (
  //           <div key={i} className="flex-shrink-0 w-[330px]">
  //             <Card className="overflow-hidden">
  //               <Skeleton className="w-full" />
  //               <div className="p-4">
  //                 <Skeleton className="h-4 w-3/4 mb-2" />
  //                 <Skeleton className="h-3 w-1/2" />
  //               </div>
  //             </Card>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   )
  // }


  if (content.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-center py-8 text-muted-foreground">
          No content available in this category.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 lg:mx-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2 sm:px-0">{title}</h2>

      <div className="relative group">
        {/* Left navigation button */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {content.length > 2 && scrollPosition > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => scroll("left")}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
          )}
        </div>

        {/* Content container */}
        <div
          ref={containerRef}
          className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide py-2 sm:py-4 px-2 sm:px-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="region"
          aria-label={`${title} content row`}
          tabIndex={0}
        >
          {content.map((item) => (
            <Link
              key={item.id}
              href={`/title/${item.id}`}
              className="flex-shrink-0 w-24 sm:w-32 md:w-40 lg:w-48"
              aria-label={`${item.name} - ${item.episode.length} episodes`}
            >
              <Card className="overflow-hidden bg-transparent border-0 w-full group/card gap-0">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={item.thumbnailImageUrl || "/placeholder.svg"}
                    alt={`${item.name} thumbnail`}
                    fill
                    className="object-cover rounded-md transition-transform duration-200 group-hover/card:scale-105"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  />
                  {item.contentRating && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/70 text-white px-1 py-0.5 sm:px-2 sm:py-1 rounded text-xs flex items-center gap-1">
                      <Star className="size-3 sm:size-4 fill-yellow-500" />
                      <span className="text-xs">
                        {item.contentRating.rating
                          ? item.contentRating.rating
                          : 0}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 px-1 py-0.5 sm:px-2 sm:py-1 text-xs text-white bg-black/50 rounded">
                    {item.episode.length} Eps
                  </div>
                </div>
                <div className="p-1 sm:p-2">
                  <h3 className="font-medium text-xs sm:text-sm line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Right navigation button */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {content.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => scroll("right")}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
