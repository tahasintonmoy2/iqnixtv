"use client";

import {
  AddToPlaylistButton
} from "@/components/add-to-playlist-button";
import { useTrailerVideo } from "@/hooks/use-trailer-video";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import Player from "next-video/background-player";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

interface SeriesBackgroundVideoProps {
  playbackId: string | null;
  posterUrl: string | null;
  trailerId: string;
  seriesId: string;
  playlistId: string;
  seriesName: string;
  seriesDescription: string | null;
  seriesRegion: string | null;
  seriesReleaseDate: Date | null;
  seriesAgeRating: string | undefined;
  seriesStarringCast: string | null;
  seasonId: string;
  episodeId: string;
}

export const SeriesHeroSection = ({
  playbackId,
  episodeId,
  posterUrl,
  trailerId,
  seriesId,
  playlistId,
  seasonId,
  seriesAgeRating,
  seriesStarringCast,
  seriesDescription,
  seriesName,
  seriesRegion,
  seriesReleaseDate,
}: SeriesBackgroundVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const { isOpen } = useTrailerVideo();
  const isMuted = volume === 0;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isPlaying ? video.play() : video.pause();
  }, [isPlaying, isOpen]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  const togglePlay = () => setIsPlaying((curr) => !curr);

  const onVolumeChange = () => {
    if (videoRef.current) {
      videoRef.current.muted = volume === 0;
      videoRef.current.volume = +volume * 0.01;
    }
  };

  const toggleMute = () => {
    setVolume(isMuted ? 100 : 0);

    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };

  // Load event to fade from poster → video
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    videoRef.current?.play().catch(() => {});
    setIsPlaying(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className={cn("relative  md:h-[80vh] h-[75vh]")}>
        {/* Background Image and Video */}
        <div className="absolute inset-0 mobile-series-hero">
          <div className="h-164">
            <div className="bannerImageUrl">
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt={posterUrl || ""}
                fill
                className={cn(
                  "object-cover overflow-hidden absolute",
                  isVideoLoaded ? "hidden" : "block"
                )}
              />
            </div>
            <div className="bannerImageUrl-mobile">
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt={posterUrl || ""}
                height={192}
                width={500}
                className={cn(
                  "object-cover overflow-hidden absolute",
                  isVideoLoaded ? "hidden" : "block"
                )}
              />
            </div>
            <Player
              ref={videoRef}
              src={`https://stream.mux.com/${playbackId}.m3u8`}
              onLoadedData={handleVideoLoaded}
              onVolumeChange={onVolumeChange}
              className={cn(
                "overflow-hidden block! h-128!",
                isVideoLoaded ? "block" : "hidden"
              )}
            />
          </div>
          <div className="absolute inset-0 series-shadow bg-linear-to-r from-black/95 via-black/75 to-transparent" />
          <div className="absolute inset-0 series-shadow bg-linear-to-t from-neutral-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-6 sm:px-12 md:px-16 pb-12 md:pb-24">
          <div>
            {/* Title */}
            <h1 className="mb-4 lg:text-3xl text-2xl text-white">
              {seriesName}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
                {seriesRegion || "Not Rated"}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
                {format(`${seriesReleaseDate}`, "yyyy")}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
                {seriesAgeRating || "Not Rated"}
              </span>
            </div>

            {/* Description */}
            <p className="mb-6 max-w-xl text-sm sm:text-base text-neutral-300 leading-relaxed">
              {seriesDescription}
            </p>

            {/* Starring */}
            <div className="mb-6 text-sm text-neutral-400">
              <span className="text-muted-foreground">Starring:</span>{" "}
              {seriesStarringCast}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-between">
              <div className="gap-4">
                <Link href={`/play/${seasonId}/${episodeId}`}>
                  <Button className="group relative gap-2 overflow-hidden bg-primary transition-all duration-300 hover:bg-primary/90 mr-4">
                    <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    <Play size={16} className="fill-current" />
                    Play
                  </Button>
                </Link>
                <AddToPlaylistButton
                  seriesId={seriesId}
                  playlistId={playlistId}
                />
              </div>
              {trailerId && (
                <div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                    className="rounded-full"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={16} className="fill-current" />
                    ) : (
                      <Play size={16} className="fill-current" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-4 rounded-full"
                    title={isMuted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX size={16} className="fill-current" />
                    ) : (
                      <Volume2 size={16} className="fill-current" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
