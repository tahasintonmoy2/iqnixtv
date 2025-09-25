"use client";

import { useMobile } from "@/hooks/use-mobile";
import {
  Cast,
  Comment,
  Episode,
  Genre,
  Like,
  Reply,
  Season,
  Series,
  User,
} from "@/lib/generated/prisma";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { CommentCard } from "./comment-card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { RelatedContent } from "./related-content";

interface EpisodeBottomInfoProps {
  episode: Episode & {
    comments: (Comment & {
      replies: (Reply & {
        user: User;
        likes: Like[];
      })[];
      user: User;
      likes: Like[];
    })[];
  };
  season: Season & {
    casts?: Cast[];
    episode: Episode[];
    genres?: Genre[];
  };
  series: Series[];
  contentGenre: string[];
  contentAgeRating: string;
  lengthOfEpisode: number;
}

export const EpisodeBottomInfo = ({
  episode,
  series,
  season,
  contentGenre,
  contentAgeRating,
  lengthOfEpisode,
}: EpisodeBottomInfoProps) => {
  const isMobile = useMobile();

  return (
    <div className="mt-8 overflow-hidden lg:w-[54rem]">
      <div>
        {!isMobile ? (
          <div className="flex items-center mb-1">
            <h2 className="text-2xl font-bold">{series[0].name}</h2>
            <span className="text-lg text-muted-foreground lg:gap-x-6">
              <ChevronRight className="size-6" />
            </span>
            <h2 className="text-2xl font-bold">{episode.name}</h2>
          </div>
        ) : (
          <div className="flex items-center mb-1">
            <h2 className="text-2xl font-bold">{series[0].name}</h2>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <Badge variant="outline">{contentAgeRating}</Badge>
          <p className="text-sm text-muted-foreground">|</p>
          <span>
            {episode.releaseDate
              ? format(episode.releaseDate, "yyyy")
              : "Unknown"}
          </span>
          <p className="text-sm text-muted-foreground">|</p>
          <span>{series[0].region}</span>
          {!isMobile && (
            <>
              <p className="text-sm text-muted-foreground">|</p>
              {contentGenre.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </>
          )}
          <p className="text-sm text-muted-foreground">|</p>
          <span>{lengthOfEpisode} Episodes</span>
        </div>
        <div className="my-8">
          <div className="bg-secondary rounded-lg">
            <h1 className="px-4 py-2">{episode.description}</h1>
          </div>
        </div>
        <Separator />
        <div className="py-4">
          <h1 className="text-lg font-semibold">Recommendations</h1>
          <RelatedContent content={series} season={season} />
        </div>
        <Separator />
        <div className="mt-12">
          <CommentCard comments={episode.comments} episodeId={episode.id} />
        </div>
      </div>
    </div>
  );
};
