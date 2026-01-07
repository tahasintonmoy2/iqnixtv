import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seriesId: string; trailerId: string }> }
) {
  try {
    const user = await currentUser();
    const { seriesId, trailerId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const trailer = await db.trailers.findUnique({
      where: {
        id: trailerId,
        seriesId,
      },
    });

    if (!trailer) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const muxData = await db.muxData.findUnique({
      where: {
        trailerId,
      },
    });

    if (
      !trailer ||
      !muxData ||
      !trailer.name ||
      !trailer.type ||
      !trailer.videoUrl ||
      !trailer.seriesId
    ) {
      return new NextResponse("Missing fields are required", { status: 400 });
    }

    const unpublishedTrailer = await db.trailers.update({
      where: {
        id: trailerId,
        seriesId,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unpublishedTrailer);
  } catch (error) {
    console.error("Chapter publish Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
