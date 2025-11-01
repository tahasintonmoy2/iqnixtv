"use client";

import "@mux/mux-player-react/themes/classic";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled.js";
import { toast } from "sonner";

import { VideoPlayer as NextPlayer } from "@/components/video-player";
import { useUser } from "@/hooks/use-user";
import { Episode } from "@/lib/generated/prisma";
import axios from "axios";

interface VideoPlayerProps {
  playbackId: string;
  seasonId: string;
  episodeId: string;
  seriesId: string;
  nextEpisodeId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title?: string;
  episodes: Episode[];
  initialProgress?: number;
}

export const VideoPlayer = ({
  seasonId,
  nextEpisodeId,
  seriesId,
  isLocked,
  episodes,
  episodeId,
  playbackId,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const playerRef = useRef<InstanceType<typeof shaka.Player> | null>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(20);
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [showNextEpisodeIndicator, setShowNextEpisodeIndicator] =
    useState(false);

  const router = useRouter();
  const user = useUser();

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

  const onEnd = async () => {
    try {
      if (nextEpisodeId) {
        router.refresh();

        if (nextEpisodeId) {
          router.push(`/play/${seasonId}/${nextEpisodeId}`);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Unauthorized. Please login to continue.");
      router.refresh();
    }
  };

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isLoaded) return;

    // Set initial progress after a small delay to ensure video is ready
    const initProgressTimeout = setTimeout(() => {
      if (initialProgress > 0 && player) {
        player.currentTime(initialProgress);
      }
    }, 100);

    const handleTimeUpdate = () => {
      const currentTime = player.currentTime();
      const duration = player.duration();

      if (currentTime && duration) {
        debouncedUpdateProgress(currentTime, duration);
      }
    };

    const handleLoadedData = () => {
      if (initialProgress > 0) {
        player.currentTime(initialProgress);
      }
    };

    player.addEventListener("timeupdate", handleTimeUpdate);
    player.addEventListener("loadeddata", handleLoadedData);

    return () => {
      clearTimeout(initProgressTimeout);
      if (player) {
        player.removeEventListener("timeupdate", handleTimeUpdate);
        player.removeEventListener("loadeddata", handleLoadedData);
      }
    };
  }, [isLoaded, debouncedUpdateProgress, initialProgress]);

  const handlePlayNext = useCallback(() => {
    setCurrentPlaylistIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < episodes.length) {
        return nextIndex;
      }
      return prev;
    });
  }, [episodes.length]);

  const handlePlayPrevious = useCallback(() => {
    const index = episodes.findIndex((episode) => episode.id === episodeId);
    if (index !== -1) {
      setCurrentPlaylistIndex(index);
    }
  }, [episodes, episodeId]);

  const hasNext = currentPlaylistIndex < episodes.length - 1;
  const hasPrevious = currentPlaylistIndex > 0;

  const muxConfig = {
    playbackId,
  };

  return (
    <div className="relative aspect-video overflow-hidden">
      {/*  {!isReady && !isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md">
          <div className="loader-lg" />
          <p className="mt-3">
            {playbackError && !showError
              ? "Checking playback availability..."
              : "Please wait a moment, episode is loading"}
          </p>
        </div>
      )} */}
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
            Episode content is not available. Please try again later.
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
        <div className="flex flex-col items-center justify-center rounded-lg">
          <NextPlayer
            muxConfig={muxConfig}
            thumbnail={`https://image.mux.com/${muxConfig.playbackId}/thumbnail.png?time=0`}
            onEnded={onEnd}
            onTimeUpdate={(currentTime, duration) => {
              // Handle progress updates
              debouncedUpdateProgress(currentTime, duration);

              // Handle next episode indicator
              const timeLeft = duration - currentTime;
              if (timeLeft <= 8 && nextEpisodeId) {
                if (!showNextEpisodeIndicator) {
                  setRemainingSeconds(Math.max(0, Math.floor(timeLeft)));
                  setShowNextEpisodeIndicator(true);
                }
              } else {
                setShowNextEpisodeIndicator(false);
              }
            }}
            onLoadStart={() => setIsLoaded(true)}
            onPlayNext={handlePlayNext}
            onPlayPrevious={handlePlayPrevious}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            episodes={episodes}
            episodeId={episodeId}
            className="rounded-lg overflow-hidden shadow-2xl"
          />
          {/* <Video
            playbackId={playbackId}
            thumbnail={`https://image.mux.com/${playbackId}/thumbnail.png?time=0`}
            className={cn(
              "aspect-video rounded-lg overflow-hidden object-cover",
              !isReady && "hidden",
            )}
            onCanPlay={() => {
              console.log("Video can play");
              setIsReady(true);
            }}
            onLoadStart={() => {
              console.log("Video load started");
              setIsLoaded(true);
            }}
            onError={(error) => {
              console.error("Video error:", error);
              setPlaybackError(true);
              setShowError(true);
              toast.error("Error loading video. Please try again.");
            }}
            onEnded={onEnd}
            onTimeUpdate={(currentTime, duration) => {
              // Handle progress updates
              debouncedUpdateProgress(currentTime, duration);

              // Handle next episode indicator
              const timeLeft = duration - currentTime;
              if (timeLeft <= 8 && nextEpisodeId) {
                if (!showNextEpisodeIndicator) {
                  setRemainingSeconds(Math.max(0, Math.floor(timeLeft)));
                  setShowNextEpisodeIndicator(true);
                }
              }
            }}
            hasNextEpisode={!!nextEpisodeId}
            episodeId={episodeId}
            episodes={episodes}
          /> */}
          {/* <MuxPlayer
            ref={playerRef}
            className={cn(
              "aspect-video rounded-lg overflow-hidden object-cover",
              !isReady && "hidden"
            )}
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
            onTimeUpdate={onTimeUpdate}
            onLoadStart={() => setIsLoaded(true)}
            onError={() => {
              setPlaybackError(true);
              // Show error message after a loading delay
              setTimeout(() => setShowError(true), 2000);
            }}
            streamType="on-demand"
            autoPlay
            muted
            playbackId={playbackId}
          /> */}
          {showNextEpisodeIndicator && nextEpisodeId && (
            <div className="absolute inset-x-0 z-[100] bottom-24 flex items-start justify-end px-4">
              <div className="bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-300">
                  Next episode in {remainingSeconds}{" "}
                  {remainingSeconds === 1 ? "second" : "seconds"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
