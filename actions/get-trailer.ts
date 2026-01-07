import { db } from "@/lib/db";

interface GetChapterProps {
  trailerId: string;
}

export const getTrailer = async ({ trailerId }: GetChapterProps) => {
  try {
    let muxData = null;

    const trailer = await db.trailers.findUnique({
      where: {
        id: trailerId,
        isPublished: true
      }
    });

    if (!trailer?.id) {
      throw new Error("Failed to fetch episode data");
    }

    // Fetch MuxData regardless of episode status
    try {
      muxData = await db.muxData.findUnique({
        where: {
          trailerId: trailer.id,
        },
      });
    } catch (muxError) {
      console.error("Error fetching MuxData:", muxError);
    }

    return {
      muxData,
    };
  } catch (error) {
    console.log("GET EPISODE ERROR", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch episode: ${error.message}`);
    }
    throw new Error("Failed to fetch episode data");
  }
};
