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

type SearchResultsProps = {
  query: string;
  seasonId: string;
  episodeId: string;
};

export function SearchResults({
  query,
  episodeId,
  seasonId,
}: SearchResultsProps) {
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Start Your Search</h2>
        <p className="text-muted-foreground">
          Enter a search term to find movies, TV shows, actors, and more
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="bg-muted h-40" />
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
        <p className="text-muted-foreground mb-4">
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
    <div className="space-y-6">
      <div className="gap-4">
        {results.map((result) => (
          <div
            className="overflow-hidden flex items-start transition-colors gap-0 bg-transparent border-0"
            key={result.id}
          >
            {result.image ? (
              <Link href={`/play/${seasonId}/${episodeId}`}>
                <div className="relative">
                  <Image
                    src={result.image || "/placeholder.svg"}
                    alt={result.title}
                    height={200}
                    width={200}
                    className="object-cover rounded-md"
                  />
                </div>
              </Link>
            ) : (
              <div className="bg-muted flex items-center justify-center">
                <div className="text-4xl">
                  {result.type === "actor"
                    ? "👤"
                    : result.type === "genre"
                      ? "🎭"
                      : "🎬"}
                </div>
              </div>
            )}
            <div className="p-3">
              <Link href={`/play/${seasonId}/${episodeId}`}>
                <h3 className="font-medium lg:text-2xl text-lg line-clamp-1 mb-1 hover:text-primary">
                  {result.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="capitalize">{result.type}</span>
                {result.year && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {result.year}
                    </span>
                  </>
                )}
              </div>
              {result.rating && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{result.rating}</span>
                </div>
              )}
              {result.episodes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Play className="h-3 w-3" />
                  <span>{result.episodes} episodes</span>
                </div>
              )}
              {result.cast && result.cast.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="line-clamp-1">{result.cast.join(", ")}</span>
                </div>
              )}
              {result.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {result.description}
                </p>
              )}
              <div className="my-2">
                <Link href={`/play/${seasonId}/${episodeId}`}>
                  <Button>
                    <Play className="size-4" />
                    Play
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
