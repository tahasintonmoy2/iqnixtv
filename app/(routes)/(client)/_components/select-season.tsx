"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { EpisodeSlider } from "@/components/episode-slider";
import { SeasonSelectorClient } from "@/components/season-selector-client";
import { Episode, Season, Series } from "@/lib/generated/prisma";

interface SeasonProps {
  seasons: Season[];
  episodes: (Episode & {
    thumbnailUrl?: string;
    duration?: number;
    seasonId: string;
  })[];
  series: Series & {
    seasons: Season[];
    episodes: (Episode & {
      thumbnailUrl?: string;
      duration?: number;
      seasonId: string;
    })[];
  };
}

export const SelectSeason = ({ seasons, episodes, series }: SeasonProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonId = searchParams.get("seasonId");

  // Debug logging
  console.log("SelectSeason received data:", {
    seasons: seasons,
    episodes: episodes,
    series: series,
    seasonId: seasonId
  });

  // Use the first season as default if no season is selected
  const selectedSeason = seasonId || seasons[0]?.id || "";

  // Filter episodes by current season
  const filteredEpisodes = episodes.filter(
    (episode) => episode.seasonId === selectedSeason
  );

  console.log("Filtered episodes:", {
    selectedSeason,
    filteredEpisodes,
    totalEpisodes: episodes.length
  });

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
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Episodes</h2>
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
          <EpisodeSlider
            series={{
              ...series,
              episodes: filteredEpisodes,
            }}
          />
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
