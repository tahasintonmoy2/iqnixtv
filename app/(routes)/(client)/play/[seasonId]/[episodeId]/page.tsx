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

  const series = await db.series.findFirst({
    where: {
      isPublished: true,
    },
  });

  const episode = await db.episode.findUnique({
    where: {
      id: episodeId,
    },
  });

  const season = await db.season.findUnique({
    where: {
      id: seasonId,
    },
  });

  if (!episode?.id || !season?.id || !season?.id) {
    return {
      title: "Iqnix TV",
    };
  }

  return {
    title: `Watch ${series?.name} - S${season.seasonNumber} - Ep ${episode.episodeNumber}`,
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

  const { nextEpisode, muxData } = await getEpisode({ seasonId, episodeId });

  const episode = await db.episode.findMany({
    where: {
      isPublished: true,
    },
    include: {
      comments: {
        include: {
          replies: true,
          user: true,
          likes: true
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

  const seasons = await db.season.findMany({
    where: {
      isPublished: true,
    },
    include: {
      episodes: {
        where: {
          isPublished: true
        }
      }
    },
    orderBy: {
      seasonNumber: "asc",
    },
  });

  const series = await db.series.findMany({
    where: {
      isPublished: true,
    },
    include: {
      genre: true,
      ageRating: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  // Resolve genre names from the stored genreId (which may contain comma-separated IDs)
  const selectedGenreIds = (series?.[0]?.genreId ?? "")
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

  if (!muxData?.playbackId) {
    throw new Error("PlaybackId not found");
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 mt-16">
          <div className="relative lg:w-[900px] w-full">
            <VideoPlayer
              playbackId={muxData?.playbackId}
              seasonId={seasonId}
              episodeId={episodeId}
              isLocked={false}
              nextEpisodeId={nextEpisode?.id}
              completeOnEnd={false}
            />
          </div>
          <EpisodeInfo
            season={seasons}
            episode={episode}
            episodeId={episodeId}
          />
          <EpisodeBottomInfo
            episode={episode[0]}
            season={seasons}
            series={series}
            contentAgeRating={series[0].ageRating?.name ?? "Not Rated"}
            contentGenre={genreNames}
            lengthOfEpisode={episode.length}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
