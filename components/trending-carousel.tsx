"use client";

import { Button } from "@/components/ui/button";
import { AgeRating, Episode, Season, Series } from "@/lib/generated/prisma";
import { format } from "date-fns";
import { } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface CarouselProps {
  series: (Series & {
    seasons: Season[];
    episodes: Episode[];
    ageRating: AgeRating;
  })[];
  episode: (Episode & {
    thumbnailImageUrl?: string;
    duration?: number;
    seasonId: string;
  })[];
  contentAgeRating?: string;
}

export function TrendingCarousel({ series }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = series[activeIndex];

  // Auto-advance carousel
  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setActiveIndex((current) => (current + 1) % series.length);
      }
    }, 4000);
  }, [isPaused, series.length]);

  const stopAutoAdvance = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoAdvance();
    return () => stopAutoAdvance();
  }, [startAutoAdvance, stopAutoAdvance]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex(
          (current) => (current - 1 + series.length) % series.length
        );
        stopAutoAdvance();
        setTimeout(startAutoAdvance, 1000);
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % series.length);
        stopAutoAdvance();
        setTimeout(startAutoAdvance, 1000);
      } else if (event.key === " ") {
        event.preventDefault();
        setIsPaused(!isPaused);
      }
    },
    [isPaused, series.length, startAutoAdvance, stopAutoAdvance]
  );

  // Touch handling for mobile
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
      setActiveIndex((current) => (current + 1) % series.length);
    } else if (isRightSwipe) {
      setActiveIndex(
        (current) => (current - 1 + series.length) % series.length
      );
    }

    stopAutoAdvance();
    setTimeout(startAutoAdvance, 1000);
  };

  // Navigation functions
  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + series.length) % series.length);
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 1000);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % series.length);
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 1000);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    stopAutoAdvance();
    setTimeout(startAutoAdvance, 1000);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      ref={carouselRef}
      className="relative w-full h-[66vh] sm:h-[50vh] md:h-[60vh] lg:h-[94vh] xl:h-[98vh]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured content carousel"
      tabIndex={0}
    >
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <Image
          src={currentItem?.thumbnailImageUrl || "/placeholder.svg"}
          alt={`${currentItem?.name} - Featured content`}
          fill
          className="w-full h-full object-cover"
          priority={activeIndex === 0}
          sizes="100vw"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Navigation buttons */}
      {series?.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white border-white/20"
            size="icon"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
          <Button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white border-white/20"
            size="icon"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-center z-20">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full lg:pt-28 pt-40">
          <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 text-white leading-tight">
              {currentItem?.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90 mb-3 sm:mb-4">
              <Badge
                variant="outline"
                className="text-white border-white/30 bg-black/30"
              >
                {currentItem?.ageRating?.name}
              </Badge>
              <span className="hidden sm:inline">|</span>
              <span>
                {currentItem?.releaseDate
                  ? format(currentItem.releaseDate, "yyyy")
                  : "Unknown"}
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="truncate">{currentItem?.region}</span>
            </div>

            <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {currentItem?.description}
            </p>

            <div className="flex gap-2 sm:gap-4">
              <Link href={`/play/${currentItem?.seasons[0]?.id}`}>
                <Button className="gap-2" size="sm">
                  <Play size={16} />
                  Play
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" size="sm">
                <Plus size={16} />
                My List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {series.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {series.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
