"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Series } from "@/lib/generated/prisma";
import { format } from "date-fns";
import { Fragment } from "react";

interface DramaDetailsProps {
  content: Series[];
  contentAgeRating: string | null;
  contentGenre: string[];
  contentLanguage: string[];
}

export function DramaDetails({
  content,
  contentAgeRating,
  contentGenre,
  contentLanguage,
}: DramaDetailsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {content.map((content) => (
          <Fragment key={content.id}>
            <TabsContent value="overview" className="text-muted-foreground">
              <p className="mb-4">{content.description}</p>
            </TabsContent>

            <TabsContent value="cast">
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Cast</h1>
                <span>{content.castDescription}</span>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {contentGenre.map((genre) => (
                      <span
                        className="bg-muted px-2 py-1 rounded-md text-sm"
                        key={genre}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {contentLanguage.map((language) => (
                      <span
                        className="bg-muted px-2 py-1 rounded-md text-sm"
                        key={language}
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Release Year</h3>
                  <p>{format(`${content.releaseDate}`, "yyyy")}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Maturity Rating</h3>
                  <p>{contentAgeRating}</p>
                </div>
              </div>
            </TabsContent>
          </Fragment>
        ))}
      </Tabs>
    </div>
  );
}
