import { getEpisode } from "@/actions/get-episode";
import { EpisodeBottomInfo } from "@/components/episode-bottom-info";
import { EpisodeInfo } from "@/components/episode-info";
import { ErrorBoundary } from "@/components/error-boundary";
import { VideoPlayer } from "@/components/video/video-player";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    seasonId: string;
    episodeId: string;
  }>;
}) {
  const { episodeId, seasonId } = await params;

  const episode = await db.episode.findUnique({
    where: {
      id: episodeId,
    },
  });

  const season = await db.season.findUnique({
    where: {
      id: seasonId,
    },
    include: {
      series: true,
    },
  });

  if (!episode?.id || !season?.id) {
    return {
      title: "Iqnix TV",
    };
  }

  return {
    title: `Watch ${season.series.name} - S${season.seasonNumber} - Ep ${episode.episodeNumber}`,
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{
    seasonId: string;
    episodeId: string;
  }>;
}) {
  const { seasonId, episodeId } = await params;

  const episodes = await db.episode.findMany({
    where: {
      seasonId,
      isPublished: true,
    },
    include: {
      comments: {
        include: {
          replies: {
            include: {
              user: true,
              likes: true,
            }
          },
          user: true,
          likes: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const seasons = await db.season.findUnique({
    where: {
      id: seasonId,
      isPublished: true,
    },
    include: {
      episodes: true,
      series: {
        include: {
          genre: true,
          ageRating: true,
        },
      },
    },
  });

  const series = seasons?.series;

  const { muxData, nextEpisode, userProgress, episode } = await getEpisode({
    episodeId,
    seasonId,
  });

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

  const isLocked = !episode?.isFree;
  const completeOnEnd = !userProgress?.isCompleted;

  return (
    <ErrorBoundary>
      <div className="mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 mt-16">
          <div className="relative lg:w-[900px] w-full">
            <VideoPlayer
              playbackId={muxData?.playbackId || ""}
              seasonId={seasonId}
              seriesId={series?.id ?? ""}
              episodeId={episodeId}
              isLocked={isLocked}
              episodes={episodes}
              nextEpisodeId={nextEpisode?.id ?? ""}
              completeOnEnd={completeOnEnd}
            />
          </div>
          <EpisodeInfo
            season={seasons ? [seasons] : []}
            episode={episodes}
            episodeId={episodeId}
          />
          <EpisodeBottomInfo
            episodes={episodes}
            seasons={seasons ? [seasons] : []}
            series={series ? [series] : []}
            contentAgeRating={series?.ageRating?.name ?? "Not Rated"}
            contentGenre={genreNames}
            lengthOfEpisode={episodes.length}
            currentEpisodeId={episodeId}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
