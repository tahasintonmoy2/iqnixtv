"use client";

import { useTrailerVideo } from "@/hooks/use-trailer-video";
import { MuxData, Trailers } from "@/lib/generated/prisma";
import { formatDuration } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { TrailerVideoModal } from "./models/trailer-video-modal";

type EpisodeSliderProps = {
  trailers: (Trailers & {
    duration?: number;
  } & MuxData)[];
};

export const TrailersSection = ({ trailers }: EpisodeSliderProps) => {
  const trailersRef = useRef<HTMLDivElement>(null);
  const { onOpen, id } = useTrailerVideo();

  const selectedTrailer = trailers.find((trailer) => trailer.id === id);

  const scrollTrailers = (direction: "left" | "right") => {
    if (trailersRef.current) {
      const scrollAmount = 400;
      trailersRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  console.log("PlaybackId ", selectedTrailer?.playbackId);

  return (
    <>
      <TrailerVideoModal
        playbackId={selectedTrailer?.playbackId || ""}
        posterUrl={selectedTrailer?.thumbnailImageUrl || ""}
      />
      <div className="mx-4 mt-2">
        <div className="group/trailers flex relative mx-4 lg:px-10">
          {/* Scroll Buttons */}
          <button
            onClick={() => scrollTrailers("left")}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/trailers:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scrollTrailers("right")}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-neutral-900/90 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-neutral-800 group-hover/trailers:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Trailers Carousel */}
          <div
            ref={trailersRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {trailers.map((trailer) => (
              <div key={trailer.id}>
                <div className="group/card relative shrink-0 w-[280px] sm:w-[320px] md:w-[360px] cursor-pointer">
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video overflow-hidden rounded-lg bg-neutral-900"
                    onClick={() => onOpen(trailer.id)}
                  >
                    <Image
                      src={trailer.thumbnailImageUrl || "/placeholder.svg"}
                      alt={trailer.name}
                      fill
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/card:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                          <Play
                            className="ml-0.5 h-5 w-5 text-black"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
                      {formatDuration(trailer.duration ?? 0)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-3">
                    <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
                      {trailer.type}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {trailer.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
