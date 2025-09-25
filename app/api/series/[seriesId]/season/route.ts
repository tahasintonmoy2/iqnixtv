import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: {  params: Promise<{ seriesId: string }> }
) {
  try {
    const body = await req.json();
    const { seriesId } = await params;

    if (!seriesId || typeof seriesId !== 'string') {
      return NextResponse.json({ error: "Valid Series ID is required" }, { status: 400 });
    }

    // Verify series exists
    const series = await db.series.findUnique({
      where: { id: seriesId }
    });

    if (!series) {
      return NextResponse.json("Series not found", { status: 404 });
    }

    const {
      name,
      description,
      releaseDate,
      seasonNumber,
      isPublished,
      trailerVideoUrl,
      regions,
      casts,
      genres,
      thumbnailImageUrl,
    } = body;

    if (!name || !releaseDate || !seasonNumber || !seriesId) {
      return NextResponse.json("Missing fields is required", { status: 400 });
    }

    // Create the season with casts and genres
    const season = await db.season.create({
      data: {
        name,
        description,
        releaseDate,
        seasonNumber,
        isPublished,
        trailerVideoUrl,
        regions,
        thumbnailImageUrl,
        seriesId,
        // Connect existing casts
        casts:
          casts && casts.length > 0
            ? {
                connect: casts.map((castId: string) => ({ id: castId })),
              }
            : undefined,
        // Connect existing genres
        genres:
          genres && genres.length > 0
            ? {
                connect: genres.map((genreId: string) => ({ id: genreId })),
              }
            : undefined,
      },
      include: {
        casts: true,
        genres: true,
      },
    });

    return NextResponse.json(season);
  } catch (error) {
    console.log("[SEASON_POST]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const seasons = await db.season.findMany({
      where: {
        isPublished: true,
      },
      include: {
        casts: true,
        genres: true,
      },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.log("[SEASON_GET]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
