import { getEpisode } from "@/actions/get-episode";
import { Navbar } from "@/components/navbar";
import { TrendingCarousel } from "@/components/trending-carousel";
import { db } from "@/lib/db";
import { isNewRelease } from "@/lib/new-release-utils";
import { isPopularContent } from "@/lib/popular-content-utils";

export const Header = async () => {
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
                thumbnailImageUrl: `https://image.mux.com/${muxData.playbackId}/thumbnail.jpg`,
                seriesId: content[0].id,
                seasonId: season.id, // Preserve the seasonId
              };
            }
    
            return {
              ...episode,
              duration: 0,
              thumbnailImageUrl: "",
              seriesId: content[0].id,
              seasonId: season.id, // Preserve the seasonId
            };
          })
        )
      );

  return (
    <header className="py-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <Navbar />
          </div>
        </div>
        <div>
          <TrendingCarousel
            series={contentWithFlags.map((item) => ({
              ...item,
              ageRating: item.ageRating ?? { name: "Not Rated", id: "not-rated" },
            }))}
            episode={episodes}
            contentAgeRating={content[0]?.ageRating?.name ?? "Not Rated"}
          />
        </div>
      </div>
    </header>
  );
};