import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Series } from "@/lib/generated/prisma";
import { format } from "date-fns";

interface ShowInfoProps {
  genreNames: string[];
  contentLanguageNames: string[];
  series: Series;
}

export const ShowInfo = ({
  genreNames,
  contentLanguageNames,
  series,
}: ShowInfoProps) => {
  return (
    <div className="mt-2 px-4">
      <div className="mx-6 grid lg:grid-cols-3 grid-cols-1 gap-4">
        <Card className="py-4 bg-transparent backdrop-blur-md">
          <CardHeader>
            <CardTitle>Watch Offline</CardTitle>
            <CardDescription>Available to download</CardDescription>
            <CardTitle>Genres</CardTitle>
            <CardDescription>
              {genreNames.length > 0 ? genreNames.join(", ") : "N/A"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="py-4 bg-transparent backdrop-blur-md">
          <CardHeader>
            <CardTitle>Audio</CardTitle>
            <CardDescription>
              {contentLanguageNames.length > 0
                ? contentLanguageNames.join(", ")
                : "N/A"}
            </CardDescription>
            <CardTitle>Subtitles</CardTitle>
            <CardDescription>
              {contentLanguageNames.length > 0
                ? contentLanguageNames.join(", ")
                : "N/A"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="py-4 bg-transparent backdrop-blur-md">
          <CardHeader>
            <CardTitle>Cast</CardTitle>
            <CardDescription>{series.castDescription}</CardDescription>
            <CardTitle>Year</CardTitle>
            <CardDescription>
              {format(`${series.releaseDate}`, "yyyy")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
