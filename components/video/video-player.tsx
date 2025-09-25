"use client";

import "@mux/mux-player-react/themes/classic";
import { Crown } from "lucide-react";
import Player from "next-video";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Video } from "./video";

interface VideoPlayerProps {
  playbackId: string;
  seasonId: string;
  episodeId: string;
  seriesId: string;
  nextEpisodeId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title?: string;
  initialProgress?: number;
}

export const VideoPlayer = ({
  seasonId,
  nextEpisodeId,
  seriesId,
  isLocked,
  episodeId,
  playbackId,
  completeOnEnd,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showNextEpisodeIndicator, setShowNextEpisodeIndicator] =
    useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(20);
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

  const onTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const player = event.target as HTMLVideoElement;
    const timeLeft = player.duration - player.currentTime;

    // Show indicator when 20 seconds are left and there's a next episode
    if (timeLeft <= 20 && nextEpisodeId) {
      if (!showNextEpisodeIndicator) {
        setShowNextEpisodeIndicator(true);
      }
      // Update the remaining seconds (rounded to whole number)
      setRemainingSeconds(Math.max(0, Math.floor(timeLeft)));
    }
  };

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/series/${seriesId}/season/${seasonId}/episode/${episodeId}/progress`,
          {
            isCompleted: true,
          }
        );

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

    if (initialProgress > 0) {
      player.currentTime = initialProgress;
    }

    const handleTimeUpdate = () => {
      const currentTime = player.currentTime;
      const duration = player.duration;

      if (currentTime && duration) {
        debouncedUpdateProgress(currentTime, duration);
      }
    };

    const handleLoadedData = () => {
      if (initialProgress > 0) {
        player.currentTime = initialProgress;
      }
    };

    player.addEventListener("timeupdate", handleTimeUpdate);
    player.addEventListener("loadeddata", handleLoadedData);

    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
      player.removeEventListener("timeupdate", handleTimeUpdate);
      player.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [isLoaded, debouncedUpdateProgress, initialProgress]);

  return (
    <div className="relative aspect-video overflow-hidden">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center border rounded-md">
          <div className="loader-lg" />
          <p className="mt-3">Please wait a moment, episode is loading</p>
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md border">
          <Crown className="size-8 text-yellow-400 fill-yellow-400" />
          <p className="text-center mx-2">
            This episode is locked. Please buy premium subscription to watch it.
          </p>
        </div>
      )}
      {!isLocked && (
        <div className="flex flex-col items-center justify-center rounded-lg">
          <Video
            playbackId={playbackId}
            thumbnail={`https://image.mux.com/${playbackId}/thumbnail.png?time=0`}
            className={cn(
              "aspect-video rounded-lg overflow-hidden object-cover",
              !isReady && "hidden"
            )}
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
          />
          {/* <Player
            ref={playerRef}
            className={cn(
              "aspect-video rounded-lg overflow-hidden object-cover",
              !isReady && "hidden"
            )}
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
            onTimeUpdate={onTimeUpdate}
            onLoadStart={() => setIsLoaded(true)}
            streamType="on-demand"
            autoPlay
            muted
            playbackId={playbackId}
          /> */}
          {showNextEpisodeIndicator && nextEpisodeId && (
            <div className="absolute bottom-16 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg">
              <p className="text-sm text-gray-300 mt-1">
                Next episode in {remainingSeconds}{" "}
                {remainingSeconds === 1 ? "second" : "seconds"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
