"use client";

import { ContentRating, Episode, Series } from "@/lib/generated/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import ContentCard from "./content-card";
import React from "react";

type CategoryRowProps = {
  title: string;
  contents: (Series & {
    contentRating?: ContentRating | null;
    episode: Episode[];
  })[];
};

export const CategoryRow = ({ title, contents }: CategoryRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="group/row relative mb-8">
      <h2 className="mb-4 px-4 sm:px-8 md:px-12 text-xl text-neutral-200">
        {title}
      </h2>

      {/* Scroll Buttons - Desktop Only */}
      {contents.length > 1 && (
        <button
          onClick={() => scroll("left")}
          className="hidden lg:flex absolute left-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-r-lg bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/row:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {contents.length > 1 && (
        <button
          onClick={() => scroll("right")}
          className="hidden lg:flex absolute right-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-l-lg bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/row:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Contentscontents Scrollable Area */}
      <div
        ref={scrollContainerRef}
        className="flex lg:gap-4 overflow-x-auto px-4 sm:px-8 md:px-12 scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {contents.map((content) => (
          <div key={content.id}>
            {contents.length > 0 ? (
              <ContentCard content={content} />
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">No content available.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
