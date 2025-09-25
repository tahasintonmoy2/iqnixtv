import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seasonId: string; episodeId: string }> }
) {
  try {
    const user = await currentUser();
    const { seasonId, episodeId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const seasonOwner = await db.season.findUnique({
      where: {
        id: seasonId,
      },
    });

    if (!seasonOwner) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const episode = await db.episode.findUnique({
      where: {
        id: episodeId,
        seasonId,
      },
    });

    if (!episode) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const muxData = await db.muxData.findUnique({
      where: {
        episodeId,
      },
    });

    if (
      !episode ||
      !muxData ||
      !episode.name ||
      !episode.description ||
      !episode.videoUrl
    ) {
      return new NextResponse("Missing fields are required", { status: 400 });
    }

    const publishedEpisode = await db.episode.update({
      where: {
        id: episodeId,
        seasonId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedEpisode);
  } catch (error) {
    console.error("Chapter publish Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
