import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(new URL(req.url).searchParams.get("limit") || "10");

    // Get all published series from the database
    const allSeries = await db.series.findFirst({
      where: { 
        isPublished: true 
      },
      select: {
        id: true,
        genreId: true
      }
    });

    if (!allSeries) {
      return new NextResponse("No series found", { status: 404 });
    }

    const seriesId = allSeries.id;
    const genre = allSeries.genreId;

    // Get the current series info to match against
    const currentSeries = await db.series.findFirst({
      where: { id: seriesId },
      select: {
        id: true,
        genreId: true
      }
    });

    if (!currentSeries) {
      return new NextResponse("Series not found", { status: 404 });
    }

    // Get related series based on genre and exclude current series
    const genreIds = genre ? genre.split(",") : currentSeries.genreId?.split(",") || [];

    const relatedSeries = await db.series.findMany({
      where: {
        AND: [
          { id: { not: seriesId } },
          { isPublished: true },
          ...(genreIds.length > 0
            ? [{
                OR: genreIds.map(id => ({
                  genreId: {
                    not: null,
                    contains: id
                  }
                }))
              }]
            : [])
        ]
      },
      take: limit,
      orderBy: [
        { createdAt: "desc" }
      ],
      include: {
        genre: true
      }
    });

    // Get seasons and episodes for the related series
    const seasonsWithEpisodes = await db.season.findMany({
      where: {
        seriesId: { in: relatedSeries.map((series) => series.id) },
        isPublished: true
      },
      include: {
        episodes: {
          where: { isPublished: true },
          orderBy: { episodeNumber: "asc" }
        }
      },
      orderBy: { seasonNumber: "asc" }
    });

    return NextResponse.json({
      content: relatedSeries,
      seasons: seasonsWithEpisodes
    });
  } catch (error) {
    console.error("[RELATED_CONTENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
