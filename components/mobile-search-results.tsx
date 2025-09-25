"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = {
  id: string;
  title: string;
  type: "drama" | "movie" | "actor" | "genre";
  image?: string;
  year?: string;
  rating?: number;
  description?: string;
  episodes?: number;
  cast?: string[];
};

type MobileSearchResultsProps = {
  query: string;
  seasonId: string;
  episodeId: string;
};

export function MobileSearchResults({
  query,
  episodeId,
  seasonId,
}: MobileSearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      // Make actual API call
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
        .then((response) => response.json())
        .then((data) => {
          if (data.results) {
            setResults(data.results);
          } else {
            setResults([]);
          }
        })
        .catch((error) => {
          console.error("Search error:", error);
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2">Start Your Search</h2>
        <p className="text-muted-foreground text-sm">
          Enter a search term to find movies, TV shows, actors, and more
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="bg-muted h-32" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold mb-2">No Results Found</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          We couldn&apos;t find anything matching &quot;{query}&quot;
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Try:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Checking your spelling</li>
            <li>Using different keywords</li>
            <li>Searching for actors or genres</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {/* Grid Layout for Mobile */}
      <div className="grid grid-cols-2 gap-3">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden hover:shadow-md transition-shadow gap-0">
            <Link href={`/play/${seasonId}/${episodeId}`}>
              <div className="relative">
                {result.image ? (
                  <Image
                    src={result.image || "/placeholder.svg"}
                    alt={result.title}
                    height={200}
                    width={200}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <div className="text-4xl">
                      {result.type === "actor"
                        ? "👤"
                        : result.type === "genre"
                          ? "🎭"
                          : "🎬"}
                    </div>
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button size="sm" className="rounded-full">
                    <Play className="size-4" />
                  </Button>
                </div>
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-black/70 text-white capitalize">
                    {result.type}
                  </span>
                </div>
                {/* Rating badge */}
                {result.rating && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-black/70 text-white flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      {result.rating}
                    </span>
                  </div>
                )}
              </div>
            </Link>
            <CardContent className="p-3">
              <Link href={`/play/${seasonId}/${episodeId}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {result.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                {result.year && (
                  <span>{result.year}</span>
                )}
                {result.episodes && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Play className="size-3" />
                      {result.episodes} Eps
                    </span>
                  </>
                )}
              </div>
              {result.cast && result.cast.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  <span className="line-clamp-1">{result.cast[0]}</span>
                  {result.cast.length > 1 && (
                    <span>+{result.cast.length - 1} more</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
