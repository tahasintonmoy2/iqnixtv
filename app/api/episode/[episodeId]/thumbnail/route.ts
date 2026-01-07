import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;

    if (!episodeId) {
      return NextResponse.json(
        { error: "Episode ID is required" },
        { status: 400 }
      );
    }

    const muxData = await db.muxData.findUnique({
      where: {
        episodeId,
      },
    });

    if (!muxData?.playbackId) {
      return NextResponse.json({ thumbnailUrl: null });
    }

    const thumbnailUrl = `https://image.mux.com/${muxData.playbackId}/thumbnail.jpg`;

    return NextResponse.json({ thumbnailUrl });
  } catch (error) {
    console.error("[EPISODE_THUMBNAIL_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

