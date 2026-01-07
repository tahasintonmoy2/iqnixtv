import { MobileSearchInput } from "@/components/mobile-search-input";
import { MobileSearchResults } from "@/components/mobile-search-results";
import { SearchResults } from "@/components/search-results";
import { db } from "@/lib/db";
import { Suspense } from "react";

function SearchPageContent({ query, seasonId, episodeId }: { 
  query: string; 
  seasonId: string; 
  episodeId: string; 
}) {
  return (
    <div className="pt-24 mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : "Search"}
        </h1>
        {query && (
          <p className="text-muted-foreground text-sm md:text-base">
            Showing results for your search query
          </p>
        )}
      </div>

      {/* Mobile Search Input */}
      <div className="mb-6 md:hidden">
        <MobileSearchInput 
          placeholder="Search movies, dramas, actresses..."
          defaultValue={query}
        />
      </div>

      {/* Search Results - Mobile vs Desktop */}
      <div className="md:hidden">
        <MobileSearchResults
          query={query}
          episodeId={episodeId}
          seasonId={seasonId}
        />
      </div>
      <div className="hidden md:block">
        <SearchResults
          query={query}
          episodeId={episodeId}
          seasonId={seasonId}
        />
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  const season = await db.season.findFirst({
    where: {
      isPublished: true,
    },
  });

  if (!season) {
    throw new Error("Season not found");
  }

  const episode = await db.episode.findFirst({
    where: {
      isPublished: true,
    },
  });

  if (!episode) {
    throw new Error("Episode not found");
  }

  return (
    <Suspense fallback={<div className="pt-24 mx-auto px-4 py-8">Loading...</div>}>
      <SearchPageContent 
        query={query}
        seasonId={season.id}
        episodeId={episode.id}
      />
    </Suspense>
  );
}
