"use client";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
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
import { Bookmark, ChevronDown, ChevronUp, Share, Tv } from "lucide-react";
import { useState } from "react";
import { CommentCard } from "./comment-card";
import { EpisodeInfoMobile } from "./episode-info-mobile";
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
  currentEpisodeId: string;
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
  const [isExpand, setIsExpand] = useState(false);

  const toggleExpand = () => setIsExpand((current) => !current);

  return (
    <div className="mt-8 overflow-hidden episode-bottom-info">
      <div>
        <div className="title-bar mb-1">
          <h2 className="text-2xl font-bold">{series[0].name}</h2>
          <ButtonGroup className="my-2">
            <Button variant="secondary">
              <Bookmark className="size-4" />
              Watch Later
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary">
              <Tv className="size-4" />
              Watch on App
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary">
              <Share className="size-4" />
              Share
            </Button>
          </ButtonGroup>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 mt-2">
          <Badge variant="outline">{contentAgeRating}</Badge>
          <p className="text-sm text-muted-foreground">|</p>
          <span>
            {episodes[0].releaseDate
              ? format(episodes[0].releaseDate, "yyyy")
              : "Unknown"}
          </span>
          <p className="text-sm text-muted-foreground">|</p>
          <span>{series[0].region}</span>
          <div className="genre-container gap-x-2">
            <p className="text-sm text-muted-foreground">|</p>
            {contentGenre.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">|</p>
          <span>{lengthOfEpisode} Episodes</span>
        </div>
        <div className="mt-5 mb-8">
          {isExpand ? (
            <div>
              <h1 className="px-2">{episodes[0].description}</h1>
            </div>
          ) : (
            <div>
              <h1 className="truncate line-clamp-2 text-wrap px-2">
                {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-expect-error
                  episodes[0].description?.length > 246
                    ? `${episodes[0].description?.slice(0, 246)}...`
                    : episodes[0].description
                }
              </h1>
            </div>
          )}
          <button
            onClick={toggleExpand}
            className="pl-2 pt-2 cursor-pointer gap-1 text-sm flex items-center text-primary"
          >
            {isExpand ? "Collapse" : "Read More"}
            {isExpand ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
          <div className="episode-info-mobile">
            <EpisodeInfoMobile
              season={seasons}
              episode={episodes}
              series={series[0]}
              episodeId={currentEpisodeId}
            />
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
