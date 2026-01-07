import { getEpisode } from "@/actions/get-episode";
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
    title: `EP${episode.episodeNumber}: Watch ${season.series.name} - S${season.seasonNumber}`,
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
            },
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

  const season = await db.season.findUnique({
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

  const seasons = await db.season.findMany({
    where: {
      id: seasonId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const series = season?.series;

  const { muxData, nextEpisode, episode } = await getEpisode({
    episodeId,
    seasonId,
  });

  const isLocked = !episode?.isFree;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 w-screen h-screen z-50">
        <div>
          <VideoPlayer
            playbackId={muxData?.playbackId || ""}
            seasonId={seasonId}
            seriesId={series?.id ?? ""}
            episodeId={episodeId}
            seasons={seasons}
            isLocked={isLocked}
            episodes={episodes}
            episode={episode}
            series={series}
            nextEpisodeId={nextEpisode?.id ?? ""}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
