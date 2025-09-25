"use client";

import { useMobile } from "@/hooks/use-mobile";
import {
  Comment,
  Episode,
  Like,
  Reply,
  Season,
  Series,
  User,
} from "@/lib/generated/prisma";
import { format } from "date-fns";
import { CommentCard } from "./comment-card";
import { RelatedContent } from "./related-content";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface EpisodeBottomInfoProps {
  episodes: (Episode & {
    comments: (Comment & {
      replies: (Reply & {
        user: User;
        likes: Like[];
      })[];
      user: User;
      likes: Like[];
    })[];
  })[];
  seasons: (Season & {
    episodes: Episode[]; // Add likes to the interface
  })[];
  series: Series[];
  contentGenre: string[];
  contentAgeRating: string;
  lengthOfEpisode: number;
  currentEpisodeId?: string;
}

export const EpisodeBottomInfo = ({
  episodes,
  series,
  seasons,
  currentEpisodeId,
  contentGenre,
  contentAgeRating,
  lengthOfEpisode,
}: EpisodeBottomInfoProps) => {
  const isMobile = useMobile();

  return (
    <div className="mt-8 overflow-hidden lg:w-[54rem]">
      <div>
        <div className="flex items-center mb-1">
          <h2 className="text-2xl font-bold">{series[0].name}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <Badge variant="outline">{contentAgeRating}</Badge>
          <p className="text-sm text-muted-foreground">|</p>
          <span>
            {episodes[0].releaseDate
              ? format(episodes[0].releaseDate, "yyyy")
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
            <h1 className="px-4 py-2">{episodes[0].description}</h1>
          </div>
        </div>
        <Separator />
        <div className="py-4">
          <h1 className="text-lg font-semibold">Recommendations</h1>
          <RelatedContent
            initialContent={{
              content: series.map((s) => ({
                ...s,
                episode: episodes.filter((ep) => ep.seriesId === s.id),
              })),
              seasons,
            }}
            seriesId={series[0].id}
            genre={contentGenre}
          />
        </div>
        <Separator />
        <div className="mt-12">
          <CommentCard
            comments={
              episodes.find((ep) => ep.id === currentEpisodeId)?.comments ||
              episodes[0].comments
            }
            episodeId={currentEpisodeId || episodes[0].id}
          />
        </div>
      </div>
    </div>
  );
};
