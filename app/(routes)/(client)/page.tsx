import { getEpisode } from "@/actions/get-episode";
import { CategoryRow } from "@/components/category-row";
import { ContinueWatching } from "@/components/continue-watching";
import { TrendingCarousel } from "@/components/trending-carousel";
import { db } from "@/lib/db";
import { isNewRelease } from "@/lib/new-release-utils";
import { isPopularContent } from "@/lib/popular-content-utils";
import { Suspense } from "react";

export default async function Home() {
  const content = await db.series.findMany({
    where: {
      isPublished: true,
    },
    include: {
      contentRating: true,
      genre: true,
      ageRating: true,
      seasons: {
        include: {
          episodes: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Add dynamic new release and popular content calculation to content
  const contentWithFlags = content.map((item) => {
    // Get all episodes from all seasons
    const allEpisodes = item.seasons.flatMap((season) => season.episodes);

    return {
      ...item,
      episodes: allEpisodes, // Keep episodes for TrendingCarousel compatibility
      episode: allEpisodes, // Map all episodes from seasons to episode for CategoryRow compatibility
      isNewRelease:
        item.isNewRelease || isNewRelease(item.createdAt, item.releaseDate),
      isPopular:
        item.isPopular ||
        isPopularContent(
          item.isPopular,
          item.viewsCount,
          item.contentRating?.rating
        ),
    };
  });

  const episodes = await Promise.all(
    contentWithFlags[0].seasons.flatMap((season) =>
      season.episodes.map(async (episode) => {
        const { muxData } = await getEpisode({
          episodeId: episode.id,
          seasonId: season.id,
        });

        if (muxData?.assetId) {
          const response = await fetch(
            `https://api.mux.com/video/v1/assets/${muxData.assetId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
                ).toString("base64")}`,
                "Content-Type": "application/json",
              },
            }
          );

          const asset = await response.json();
          return {
            ...episode,
            duration: asset.data.duration,
            thumbnailUrl: `https://image.mux.com/${muxData.playbackId}/thumbnail.jpg`,
            seriesId: content[0].id,
            seasonId: season.id, // Preserve the seasonId
          };
        }

        return {
          ...episode,
          duration: 0,
          thumbnailUrl: "",
          seriesId: content[0].id,
          seasonId: season.id, // Preserve the seasonId
        };
      })
    )
  );

  // Filter popular content
  const popularContent = contentWithFlags.filter(
    (item) =>
      item.isPopular ||
      isPopularContent(
        item.isPopular,
        item.viewsCount,
        item.contentRating?.rating
      )
  );

  return (
    <div>
      <div>
        <div className="pt-16">
          <TrendingCarousel
            series={contentWithFlags.map((item) => ({
              ...item,
              ageRating: item.ageRating ?? { name: "Not Rated", id: "not-rated" },
            }))}
            episode={episodes}
            contentAgeRating={content[0]?.ageRating?.name ?? "Not Rated"}
          />
        </div>

        {/* Continue Watching Section - Below the carousel */}
        <div className="bg-background px-8 pt-8">
          <Suspense fallback={<RecommendationsLoading />}>
            <ContinueWatching episodes={episodes} />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<RecommendationsLoading />}>
            <CategoryRow content={contentWithFlags} title="New Releases" />
          </Suspense>
        </div>

        <div className="mt-8 mx-4">
          <Suspense fallback={<RecommendationsLoading />}>
            <CategoryRow content={popularContent} title="Popular Dramas" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function RecommendationsLoading() {
  return (
    <div className="space-y-12">
      {/* Filter skeleton */}
      <div className="flex space-x-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-muted rounded-full w-24 animate-pulse"
          ></div>
        ))}
      </div>

      {/* Content skeleton */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex-none space-y-3">
                <div className="w-64 h-36 bg-muted rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
