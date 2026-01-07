import { ContentRating, Episode, Series } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ContentCardProps {
  content: Series & {
    contentRating?: ContentRating | null;
    episode: Episode[];
  };
  size?: "small" | "medium" | "large";
}

export default function ContentCard({
  content,
  size = "medium",
}: ContentCardProps) {
  const sizeClasses = {
    small: "w-36 h-52 sm:w-40 sm:h-56",
    medium: "w-44 h-60 sm:w-52 sm:h-72",
    large: "w-56 h-80 sm:w-64 sm:h-96",
  };

  return (
    <Link href={`/title/${content.id}`} className="mr-4 lg:mr-0">
      <div
        className={cn(
          `group relative flex-shrink-0 overflow-hidden rounded-md`,
          sizeClasses[size]
        )}
      >
        {/* Image */}
        <div className="h-full w-full">
          <Image
            src={content.thumbnailImageUrl || "/placeholder.svg"}
            alt={content.name}
            fill
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        </div>

        {/* Badges */}
        <div className="absolute top-0 left-0 flex gap-2">
          {content.isNewRelease && (
            <span className="rounded-tr-none rounded-bl-none rounded-br-md bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 text-xs text-white">
              NEW
            </span>
          )}
          {content.isPopular && (
            <span className="rounded-tr-none rounded-bl-none rounded-br-lg bg-gradient-to-r from-red-500 to-pink-500 px-2 py-1 text-xs text-white">
              TRENDING
            </span>
          )}
        </div>
        <div className="absolute bottom-0 right-0 z-10 rounded-tl-lg flex px-1 py-0.5 sm:px-2 sm:py-1 text-xs text-white bg-black/30 backdrop-blur-md">
          {content.episode.length} Episodes
        </div>

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="mb-2 flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-300">
            {content.contentRating && (
              <>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-yellow-500 text-yellow-500" />
                  {content.contentRating?.rating}
                </span>
                <span>•</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 cursor-pointer">
              <Play className="size-3 sm:h-4 sm:w-4" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
      <h1 className="mt-3 ml-2 line-clamp-2 lg:w-40">{content.name}</h1>
    </Link>
  );
}
