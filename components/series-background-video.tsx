"use client";

import { cn } from "@/lib/utils";
import Player from "next-video/background-player";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SeriesBackgroundVideoProps {
  playbackId: string;
  posterUrl: string;
}

export const SeriesBackgroundVideo = ({
  playbackId,
  posterUrl,
}: SeriesBackgroundVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Scroll behavior: pause when scrolling down, play when near top.
  useEffect(() => {
    const handleScroll = () => {
      if (!videoRef.current) return;

      const threshold = 200;
      if (window.scrollY > threshold) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .catch(() => {});
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load event to fade from poster → video
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div>
      <div className="h-[41rem]">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={posterUrl}
          fill
          className={cn(
            "h-full w-full object-cover overflow-hidden absolute",
            isVideoLoaded ? "hidden" : "block"
          )}
        />
        <Player
          ref={videoRef}
          src={`https://stream.mux.com/${playbackId}.m3u8`}
          onLoadedData={handleVideoLoaded}
          className={cn(
            "overflow-hidden block!",
            isVideoLoaded ? "block" : "hidden"
          )}
        />
      </div>
    </div>
  );
};
