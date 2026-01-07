"use client";

import { Episode, Season, Series } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SeasonSelectorClient } from "./season-selector-client";
import { Badge } from "./ui/badge";

type EpisodeInfoProps = {
  episode: Episode[];
  season: Season[];
  episodeId: string;
  series: Series;
};

export function EpisodeInfo({
  episode,
  season,
  episodeId,
  series,
}: EpisodeInfoProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    season[0]?.id || ""
  );

  const filteredEpisodes = episode
    .filter((ep) => ep.seasonId === selectedSeason)
    .sort((a, b) => (a?.episodeNumber ?? 0) - (b?.episodeNumber ?? 0));

  // const SAMPLE_AUDIO_TRACKS: AudioTrack[] = [
  //   {
  //     id: 0,
  //     name: "Korean (Original)",
  //     isDefault: true,
  //     isActive: false,
  //   },
  //   {
  //     id: 1,
  //     name: "Chinese",
  //     isDefault: false,
  //     isActive: false,
  //   },
  //   {
  //     id: 2,
  //     name: "English",
  //     isDefault: false,
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     name: "French",
  //     isDefault: false,
  //     isActive: false,
  //   },
  //   {
  //     id: 4,
  //     name: "Japanese",
  //     isDefault: false,
  //     isActive: false,
  //   },
  // ];

  // const [audioTracks, setAudioTracks] =
  //   useState<AudioTrack[]>(SAMPLE_AUDIO_TRACKS);
  // const [activeAudioTrackId, setActiveAudioTrackId] = useState<number>(0);

  // const handleAudioTrackSelect = (trackId: number) => {
  //   setActiveAudioTrackId(trackId);
  //   setAudioTracks((prev) =>
  //     prev.map((track) => ({
  //       ...track,
  //       isActive: track.id === trackId,
  //     }))
  //   );
  // };

  return (
    <div
      className="mt-6 bg-muted/20 border rounded-lg p-6 episode-info"
    >
      <h1 className="text-2xl mb-4 truncate">{series.name}</h1>
      <div className="flex items-center">
        <div>
          <SeasonSelectorClient
            seasons={season}
            selectedSeason={selectedSeason}
            onSelectSeason={setSelectedSeason}
          />
        </div>
        {series.isPaid && <Badge className="rounded-sm ml-3">VIP</Badge>}
      </div>

      {/* {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div></div>
        </div>
      )} */}
      <div className="mt-4 flex items-center flex-wrap gap-x-2 relative">
        {filteredEpisodes.length === 0 && (
          <div>
            <h1>No episode here</h1>
          </div>
        )}
        {filteredEpisodes.map((episode) => (
          <div
            key={episode.id}
            className={cn(
              "bg-secondary min-w-10 py-1 flex flex-col cursor-pointer rounded-sm relative h-[40.8px] px-2 items-center whitespace-nowrap overflow-hidden text-ellipsis",
              episode.id === episodeId
                ? "text-violet-600"
                : "hover:text-violet-600"
            )}
            onClick={() => {
              if (episode.id !== episodeId) {
                window.location.href = `/play/${episode.seasonId}/${episode.id}`;
              }
            }}
          >
            <p className={cn(!episode.isFree ? "pt-[0.1rem]" : "pt-[0.4rem]")}>
              {episode.episodeNumber}
            </p>
            {!episode.isFree && (
              <div className="absolute bottom-0 right-0 bg-violet-600/60 text-white text-[10px] px-1 rounded-tl-sm">
                VIP
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
