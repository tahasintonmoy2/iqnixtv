"use client";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { Episode, Season } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AudioTrackSelector, type AudioTrack } from "./audio-track-selector";
import { SeasonSelectorClient } from "./season-selector-client";

type EpisodeInfoProps = {
  episode: Episode[];
  season: Season[];
  episodeId: string;
};

export function EpisodeInfo({ episode, season, episodeId }: EpisodeInfoProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    season[0]?.id || ""
  );
  const isMobile = useMobile();

  const filteredEpisodes = episode
    .filter((ep)=> ep.seasonId === selectedSeason)
    .sort((a, b) => (a?.episodeNumber ?? 0) - (b?.episodeNumber ?? 0));

  const SAMPLE_AUDIO_TRACKS: AudioTrack[] = [
    {
      id: 0,
      name: "Korean (Original)",
      isDefault: true,
      isActive: false,
    },
    {
      id: 1,
      name: "Chinese",
      isDefault: false,
      isActive: false,
    },
    {
      id: 2,
      name: "English",
      isDefault: false,
      isActive: true,
    },
    {
      id: 3,
      name: "French",
      isDefault: false,
      isActive: false,
    },
    {
      id: 4,
      name: "Japanese",
      isDefault: false,
      isActive: false,
    },
  ];

  const [audioTracks, setAudioTracks] =
    useState<AudioTrack[]>(SAMPLE_AUDIO_TRACKS);
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<number>(0);

  // Handle audio track selection
  const handleAudioTrackSelect = (trackId: number) => {
    // Update local state immediately for UI feedback
    setActiveAudioTrackId(trackId);
    setAudioTracks((prev) =>
      prev.map((track) => ({
        ...track,
        isActive: track.id === trackId,
      }))
    );
  };

  return (
    <div
      className={cn(
        "mt-6 bg-muted/20 border rounded-lg p-6",
        isMobile ? "ml-0 w-full" : "ml-[20rem] w-[18rem]"
      )}
    >
      <div className="mb-4">
        <AudioTrackSelector
          tracks={audioTracks}
          activeTrackId={activeAudioTrackId}
          onTrackChange={handleAudioTrackSelect}
        />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <SeasonSelectorClient
            seasons={season}
            selectedSeason={selectedSeason}
            onSelectSeason={setSelectedSeason}
          />
        </div>
      </div>

      {/* {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div></div>
        </div>
      )} */}
      <div className="mt-4 flex items-center flex-wrap gap-x-2">
        {filteredEpisodes.length === 0 && (
          <div>
            <h1>No episode here</h1>
          </div>
        )}
        {filteredEpisodes.map((episode) => (
          <Button
            key={episode.id}
            variant={episode.id === episodeId ? "default" : "secondary"}
            onClick={() => {
              if (episode.id !== episodeId) {
                window.location.href = `/play/${episode.seasonId}/${episode.id}`;
              }
            }}
          >
            {episode.episodeNumber}
          </Button>
        ))}
      </div>
    </div>
  );
}
