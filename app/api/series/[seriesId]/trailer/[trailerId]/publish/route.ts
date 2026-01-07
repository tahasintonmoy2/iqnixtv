import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ trailerId: string }> }
) {
  try {
    const user = await currentUser();
    const { trailerId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const trailer = await db.trailers.findUnique({
      where: {
        id: trailerId,
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

    const publishedTrailer = await db.trailers.update({
      where: {
        id: trailerId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedTrailer);
  } catch (error) {
    console.error("Trailer publish Error", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
