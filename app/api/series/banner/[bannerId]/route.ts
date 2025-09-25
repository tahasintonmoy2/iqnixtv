import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    const { bannerId } = await params;
    const user = await currentUser();
    const { genreId, ...values } =
      await req.json();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updateData = { ...values };

    if (genreId && Array.isArray(genreId)) {
      const episode = await db.seriesBanner.update({
        where: {
          id: bannerId,
        },
        data: {
          ...updateData,
          genreId: Array.isArray(genreId)
            ? genreId.join(", ")
            : String(genreId).trim(),
        },
      });

      return NextResponse.json(episode);
    } else {
      const episode = await db.seriesBanner.update({
        where: {
          id: bannerId,
        },
        data: {
          ...updateData,
        },
      });

      return NextResponse.json(episode);
    }
  } catch (error) {
    console.log("[SERIES_EPISODE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
