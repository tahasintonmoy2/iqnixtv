import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    const user = await currentUser();
    const { bannerId } = await params;

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const seriesOwner = await db.seriesBanner.findUnique({
      where: {
        id: bannerId,
      },
    });

    if (!seriesOwner) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (
      !seriesOwner ||
      !seriesOwner.name ||
      !seriesOwner.description ||
      !seriesOwner.bannerImageUrl ||
      !seriesOwner.region ||
      !seriesOwner.seriesId ||
      !seriesOwner.genreId
    ) {
      return new NextResponse("Missing fields are required", { status: 400 });
    }

    const publishedSeries = await db.seriesBanner.update({
      where: {
        id: bannerId,
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
