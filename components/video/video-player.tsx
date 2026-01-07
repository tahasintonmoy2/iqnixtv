"use client";

import "@mux/mux-player-react/themes/classic";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

import { toast } from "sonner";

import { VideoPlayer as NextPlayer } from "@/components/video-player";
import { useAuth } from "@/contexts/auth-context";
import { Episode, MuxData, Season, Series } from "@/lib/generated/prisma";
import axios from "axios";

interface VideoPlayerProps {
  playbackId: string;
  seasonId: string;
  episodeId: string;
  seriesId: string;
  nextEpisodeId?: string;
  isLocked: boolean;
  title?: string;
  episodes: Episode[];
  episode: Episode & { muxData: MuxData | null };
  series?: Series;
  seasons: Season[];
  initialProgress?: number;
}

export const VideoPlayer = ({
  seasonId,
  nextEpisodeId,
  seriesId,
  seasons,
  isLocked,
  episodes,
  episode,
  series,
  episodeId,
  playbackId,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isNavigatingRef = useRef(false);

  const router = useRouter();
  const {user} = useAuth();

  const updateProgress = useCallback(
    async (currentTime: number, duration: number) => {
      if (!user?.id || !duration) return;

      const progressPercent = (currentTime / duration) * 100;
      const isCompleted = progressPercent > 92;

      try {
        await axios.post(
          `/api/series/${seriesId}/season/${seasonId}/episode/${episodeId}/progress`,
          {
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            progressPercent,
            isCompleted,
          }
        );
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    [user?.id, seriesId, seasonId, episodeId]
  );

  const debouncedUpdateProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      progressUpdateTimeoutRef.current = setTimeout(() => {
        updateProgress(currentTime, duration);
      }, 3000);
    },
    [updateProgress]
  );

  const onEnd = useCallback(async () => {
    try {
      if (nextEpisodeId) {
        if (isNavigatingRef.current) return;
        isNavigatingRef.current = true;

        console.log("Video ended. Next Episode ID:", nextEpisodeId);
        if (nextEpisodeId) {
          console.log("Navigating to next episode...");
          router.push(`/play/${seasonId}/${nextEpisodeId}`);
        }
      } else {
        console.log("Video ended. No next episode.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Unauthorized. Please login to continue.");
      router.refresh();
    }
  }, [nextEpisodeId, seasonId, router]);

  const handlePlayNext = useCallback(() => {
    const currentIndex = episodes.findIndex(
      (episode) => episode.id === episodeId
    );
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentIndex + 1];
      if (nextEpisode) {
        router.push(`/play/${seasonId}/${nextEpisode.id}`);
      }
    }
  }, [episodes, episodeId, seasonId, router]);

  const handlePlayPrevious = useCallback(() => {
    const currentIndex = episodes.findIndex(
      (episode) => episode.id === episodeId
    );
    if (currentIndex > 0) {
      const prevEpisode = episodes[currentIndex - 1];
      if (prevEpisode) {
        router.push(`/play/${seasonId}/${prevEpisode.id}`);
      }
    }
  }, [episodes, episodeId, seasonId, router]);

  const currentIndex = episodes.findIndex(
    (episode) => episode.id === episodeId
  );

  const hasNext = currentIndex !== -1 && currentIndex < episodes.length - 1;
  const hasPrevious = currentIndex > 0;

  const muxConfig = {
    playbackId,
  };

  return (
    <div className="relative overflow-hidden">
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md border">
          <Crown className="size-8 text-yellow-400 fill-yellow-400" />
          <p className="text-center mx-2">
            Please buy VIP subscription to watch it.
          </p>
        </div>
      )}
      {!isLocked && !playbackId && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md border bg-black/80">
          <p className="text-white text-center">
            Episode is not available. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      )}
      {!isLocked && playbackId && (
        <div>
          <NextPlayer
            key={`${episodeId}-${playbackId}`}
            muxConfig={muxConfig}
            thumbnail={`https://image.mux.com/${muxConfig.playbackId}/thumbnail.png?time=0`}
            playbackId={episode.muxData?.playbackId}
            onEnded={onEnd}
            onTimeUpdate={(t, d) => debouncedUpdateProgress(t, d)}
            onPlayNext={handlePlayNext}
            onPlayPrevious={handlePlayPrevious}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            seriesId={seriesId}
            seasons={seasons}
            episodes={episodes}
            episode={episode}
            series={series}
            episodeId={episodeId}
            initialProgress={initialProgress}
            nextEpisodeId={nextEpisodeId}
          />
        </div>
      )}
    </div>
  );
};
