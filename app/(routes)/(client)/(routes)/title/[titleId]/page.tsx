import { getEpisode } from "@/actions/get-episode";
import { getTrailer } from "@/actions/get-trailer";
import { SelectSeason } from "@/app/(routes)/(client)/_components/select-season";
import { RelatedContent } from "@/components/related-content";
import { SeriesHeroSection } from "@/components/series-hero-section";
import { MaterialTabs } from "@/components/ui/material-tabs";
import { db } from "@/lib/db";
import { formatDate } from "date-fns";
import { redirect } from "next/navigation";
import { RelatedVideos } from "../../../_components/related-videos";
import { ShowInfo } from "../../../_components/show-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ titleId: string }>;
}) {
  const { titleId } = await params;

  const content = await db.series.findUnique({
    where: {
      id: titleId,
    },
  });

  if (!content?.id) {
    return {
      title: "Iqnix TV",
    };
  }

  return {
    title: `Watch ${content?.name} (${formatDate(`${content?.releaseDate}`, "yyyy")}) with Multi-language dub`,
  };
}

export default async function DramaPage({
  params,
}: {
  params: Promise<{ titleId: string }>;
}) {
  const { titleId } = await params;

  // Single query to get series with all related data
  const series = await db.series.findUnique({
    where: {
      id: titleId,
      isPublished: true,
    },
    include: {
      contentRating: true,
      ageRating: true,
      genre: true,
      contentLanguage: true,
      trailers: true,
      playlist: true,
      playlistContent: true,
      episodes: {
        where: {
          isPublished: true,
        },
      },
      seasons: {
        where: {
          isPublished: true,
        },
        orderBy: {
          seasonNumber: "asc",
        },
        include: {
          episodes: {
            where: {
              isPublished: true,
            },
            orderBy: {
              episodeNumber: "asc",
            },
          },
        },
      },
    },
  });

  const contents = await db.series.findMany({
    where: {
      id: titleId,
    },
    include: {
      genre: true,
    },
  });

  const trailers = await db.trailers.findMany({
    where: {
      seriesId: titleId,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!series) {
    return redirect("/");
  }

  // Get all episodes for this series
  const episodes = await Promise.all(
    series.seasons.flatMap((season) =>
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
            seriesId: series.id,
            seasonId: season.id, // Preserve the seasonId
          };
        }

        return {
          ...episode,
          duration: 0,
          thumbnailImageUrl: "",
          seriesId: series.id,
          seasonId: season.id, // Preserve the seasonId
        };
      })
    )
  );

  const trailerData = await Promise.all(
    trailers.map(async (trailer) => {
      const { muxData } = await getTrailer({
        trailerId: trailer.id,
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
          ...muxData,
          ...trailer,
          duration: asset.data.duration,
          playbackId: muxData.playbackId,
          thumbnailImageUrl: `https://image.mux.com/${muxData.playbackId}/thumbnail.jpg?time=26`,
        };
      }

      return null;
    })
  );

  const trailer = trailerData.filter(
    (t): t is NonNullable<(typeof trailerData)[0]> => t !== null
  );

  // Resolve genre names from the stored genreId (which may contain comma-separated IDs)
  const selectedGenreIds = (series?.genreId ?? "")
    .split(",")
    .map((val) => val.trim())
    .filter(Boolean);

  const genreRecords = selectedGenreIds.length
    ? await db.genre.findMany({
        where: { id: { in: selectedGenreIds } },
        select: { id: true, name: true },
      })
    : [];

  const genreNames = genreRecords.map((g) => g.name);

  // Resolve genre names from the stored genreId (which may contain comma-separated IDs)
  const selectedLanguageIds = (series?.contentLanguageId ?? "")
    .split(",")
    .map((val) => val.trim())
    .filter(Boolean);

  const contentLanguageRecords = selectedLanguageIds.length
    ? await db.contentLanguage.findMany({
        where: { id: { in: selectedLanguageIds } },
        select: { id: true, name: true },
      })
    : [];

  const relatedContent = contents.filter(
    (c) => c.genre === series.genre && c.id !== series.id
  );

  const contentLanguageNames = contentLanguageRecords.map((g) => g.name);

  const tabs = [
    {
      id: "episode",
      label: "Episodes",
      content: (
        <SelectSeason
          seasons={series.seasons}
          episodes={episodes}
          series={{
            ...series,
            episodes,
          }}
        />
      ),
    },
    {
      id: "show-info",
      label: "Show Info",
      content: (
        <ShowInfo
          genreNames={genreNames}
          contentLanguageNames={contentLanguageNames}
          series={series}
        />
      ),
    },
    {
      id: "related-videos",
      label: "Related Videos",
      content: <RelatedVideos trailers={trailer} />,
    },
    {
      id: "recommended",
      label: "Recommended",
      content: (
        <RelatedContent
          initialContent={{
            content: relatedContent,
            seasons: series.seasons,
          }}
          seriesId={series.id}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto">
      <SeriesHeroSection
        playbackId={trailer[0]?.playbackId}
        posterUrl={series?.bannerImageUrl}
        trailerId={series.trailers[0]?.id}
        seriesId={titleId}
        playlistId={series?.playlistContent[0]?.playlistId}
        seriesName={series.name}
        seriesDescription={series?.description}
        seriesRegion={series?.region}
        seriesReleaseDate={series.releaseDate}
        seriesAgeRating={series.ageRating?.name}
        seriesStarringCast={series?.starringCastDescription}
        seasonId={series.seasons[0].id}
        episodeId={series.seasons[0]?.episodes[0].id}
      />

      <MaterialTabs tabs={tabs} />
    </div>
  );
}
