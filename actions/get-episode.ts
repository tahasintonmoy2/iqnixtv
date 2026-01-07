import { db } from "@/lib/db";
import { Episode } from "@/lib/generated/prisma";

interface GetChapterProps {
  seasonId: string;
  episodeId: string;
  userId?: string;
}

export const getEpisode = async ({
  seasonId,
  episodeId,
  userId,
}: GetChapterProps) => {
  try {
    // First, check if the episode exists at all
    const existingEpisode = await db.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
        muxData: true
      },
    });

    if (!existingEpisode) {
      throw new Error("Episode not found with the given ID");
    }

    // Then check if it belongs to the correct season
    if (existingEpisode.seasonId !== seasonId) {
      throw new Error("Episode does not belong to the specified season");
    }

    // Then check if both episode and season are published
    const season = await db.season.findUnique({
      where: {
        id: seasonId,
      },
    });

    if (!season) {
      throw new Error("Season not found");
    }

    if (!season.isPublished) {
      throw new Error("Season is not published");
    }

    if (!existingEpisode.isPublished) {
      throw new Error("Episode exists but is not published");
    }

    // If we get here, we have a valid, published episode
    const episode = existingEpisode;

    if (!episode) {
      // Check specific conditions for better error messages
      const rawEpisode = await db.episode.findUnique({
        where: { id: episodeId },
      });

      if (!rawEpisode) {
        throw new Error("Episode not found with the given ID");
      } else if (rawEpisode.seasonId !== seasonId) {
        throw new Error("Episode does not belong to the specified season");
      } else if (!rawEpisode.isPublished) {
        throw new Error("Episode exists but is not published");
      } else {
        throw new Error("404 Error episode or season not found");
      }
    }

    let muxData = null;
    let nextEpisode: Episode | null = null;

    // Fetch MuxData regardless of episode status
    try {
      muxData = await db.muxData.findUnique({
        where: {
          episodeId,
        },
      });
    } catch (muxError) {
      console.error("Error fetching MuxData:", muxError);
    }

    if (episode.isFree) {
      nextEpisode = await db.episode.findFirst({
        where: {
          seasonId,
          isPublished: true,
          episodeNumber: {
            gt: episode?.episodeNumber ?? 0
          }
        },
        orderBy: {
          episodeNumber: "asc",
        },
      });
    }

    const userProgress = userId
      ? await db.userProgress.findUnique({
          where: {
            userId_episodeId: {
              userId,
              episodeId,
            },
          },
        })
      : null;

    return {
      episode,
      season,
      muxData,
      userProgress,
      nextEpisode,
    };
  } catch (error) {
    console.log("GET EPISODE ERROR", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch episode: ${error.message}`);
    }
    throw new Error("Failed to fetch episode data");
  }
};
