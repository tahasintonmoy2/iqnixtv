"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { EpisodeSlider } from "@/components/episode-slider";
import { SeasonSelectorClient } from "@/components/season-selector-client";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface SeasonProps {
  seasons: Season[];
  episodes: (Episode & {
    thumbnailImageUrl?: string;
    duration?: number;
    seasonId: string;
  })[];
  series: Series & {
    seasons: Season[];
    episodes: (Episode & {
      thumbnailImageUrl?: string;
      duration?: number;
      seasonId: string;
    })[];
  };
}

export const SelectSeason = ({ seasons, episodes, series }: SeasonProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonId = searchParams.get("seasonId");

  const episodesRef = useRef<HTMLDivElement>(null);

  const scrollEpisodes = (direction: "left" | "right") => {
    if (episodesRef.current) {
      const scrollAmount = 400;
      episodesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Use the first season as default if no season is selected
  const selectedSeason = seasonId || seasons[0]?.id || "";

  // Filter episodes by current season
  const filteredEpisodes = episodes.filter(
    (episode) => episode.seasonId === selectedSeason
  );

  const handleSeasonChange = (newSeasonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("seasonId", newSeasonId);
    router.push(`?${params.toString()}`);
  };

  // If no seasons exist, don't render anything
  if (seasons.length === 0) {
    console.log("No seasons found");
    return (
      <div className="mt-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Episodes</h2>
          <p className="text-muted-foreground">
            No seasons available for this series.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-2 relative group/row">
        {filteredEpisodes.length > 1 && (
          <button
            onClick={() => scrollEpisodes("left")}
            className="hidden lg:flex absolute left-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/row:opacity-100"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        {filteredEpisodes.length > 1 && (
          <button
            onClick={() => scrollEpisodes("right")}
            className="hidden lg:flex absolute right-0 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/row:opacity-100"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
        <div className="flex items-end justify-end mb-4">
          {seasons.length > 0 && (
            <SeasonSelectorClient
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSelectSeason={handleSeasonChange}
              seriesId={series.id}
            />
          )}
        </div>
        {filteredEpisodes.length > 0 ? (
          <div
            ref={episodesRef}
            className="flex lg:gap-4 overflow-x-auto px-4 sm:px-8 md:px-12 scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            <EpisodeSlider
              series={{
                ...series,
                episodes: filteredEpisodes,
              }}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No Episodes Found</h3>
            <p className="text-muted-foreground">
              No episodes found for this season. Please select a different
              season to view episodes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
