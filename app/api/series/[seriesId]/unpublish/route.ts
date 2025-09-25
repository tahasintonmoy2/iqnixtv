import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seriesId: string; }> }
) {
  try {
    const user = await currentUser();
    const { seriesId } = await params;

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const seriesOwner = await db.series.findUnique({
      where: {
        id: seriesId,
      },
    });

    if (!seriesOwner) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    // const muxData = await db.muxData.findUnique({
    //   where: {
    //     episodeId,
    //   },
    // });

    if (
      !seriesOwner ||
      !seriesOwner.name ||
      !seriesOwner.description ||
      !seriesOwner.thumbnailImageUrl ||
      !seriesOwner.releaseDate
    ) {
      return new NextResponse("Missing fields are required", { status: 400 });
    }

    const publishedSeries = await db.series.update({
      where: {
        id: seriesId
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(publishedSeries);
  } catch (error) {
    console.error("Series publish Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
