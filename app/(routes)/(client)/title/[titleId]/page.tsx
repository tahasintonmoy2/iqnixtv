import { getEpisode } from "@/actions/get-episode";
import { SelectSeason } from "@/app/(routes)/(client)/_components/select-season";
import {
  AddToMyListButton,
  AddToPlaylistButton,
} from "@/components/add-to-playlist-button";
import { DramaDetails } from "@/components/drama-details";
import { AddWatchlistModal } from "@/components/models/add-watchlist-modal";
import { RelatedContent } from "@/components/related-content";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  const playlists = await db.playlist.findMany({
    include: {
      contents: {
        include: {
          series: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
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
            thumbnailUrl: `https://image.mux.com/${muxData.playbackId}/thumbnail.jpg`,
            seriesId: series.id,
            seasonId: season.id, // Preserve the seasonId
          };
        }

        return {
          ...episode,
          duration: 0,
          thumbnailUrl: "",
          seriesId: series.id,
          seasonId: season.id, // Preserve the seasonId
        };
      })
    )
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

  const contentLanguageNames = contentLanguageRecords.map((g) => g.name);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner section */}
      <div className="relative w-full h-[50vh] rounded-xl overflow-hidden mb-8 mt-12">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
        <Image
          src={series.bannerImageUrl || ""}
          fill
          alt="Drama cover"
          className="w-full lg:h-[42rem] object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20">
          <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary/20 text-primary px-2 py-1 capitalize rounded text-sm">
              {series.type}
            </span>
            <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
              {series.region || "Not Rated"}
            </span>
            <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
              {format(`${series.releaseDate}`, "yyyy")}
            </span>
            <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-sm">
              {series.ageRating?.name || "Not Rated"}
            </span>
          </div>
          <div className="flex gap-4">
            <Link href={`/play/${series.seasons[0]?.id}/${episodes[0]?.id}`}>
              <Button className="gap-2">
                <Play size={16} />
                Play
              </Button>
            </Link>
            {playlists.length > 0 ? (
              <div>
                <AddToMyListButton />
                <AddWatchlistModal
                  seriesId={series?.id}
                  playlists={playlists}
                />
              </div>
            ) : (
              <AddToPlaylistButton seriesId={series.id} />
            )}
          </div>
        </div>
      </div>

      <DramaDetails
        content={[series]}
        contentAgeRating={series.ageRating?.name ?? ""}
        contentLanguage={contentLanguageNames}
        contentGenre={genreNames}
      />

      <SelectSeason
        seasons={series.seasons}
        episodes={episodes}
        series={{
          ...series,
          episodes,
        }}
      />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">More Like This</h2>
        <RelatedContent
          initialContent={{
            content: [{ ...series }],
            seasons: series.seasons,
          }}
          seriesId={series.id}
        />
      </div>
    </div>
  );
}
