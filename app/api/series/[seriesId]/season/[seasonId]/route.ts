import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;
    const body = await req.json();

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

    if (!seasonId) {
      return NextResponse.json("Season ID is required", { status: 400 });
    }

    // First, disconnect all existing casts and genres
    await db.season.update({
      where: { id: seasonId },
      data: {
        casts: {
          set: [], // Disconnect all existing casts
        },
        genres: {
          set: [], // Disconnect all existing genres
        },
      },
    });

    // Then update the season with new data and reconnect casts/genres
    const updatedSeason = await db.season.update({
      where: { id: seasonId },
      data: {
        name,
        description,
        releaseDate,
        seasonNumber,
        isPublished,
        trailerVideoUrl,
        regions,
        thumbnailImageUrl,
        // Connect new casts
        casts: casts && casts.length > 0 ? {
          connect: casts.map((castId: string) => ({ id: castId }))
        } : undefined,
        // Connect new genres
        genres: genres && genres.length > 0 ? {
          connect: genres.map((genreId: string) => ({ id: genreId }))
        } : undefined,
      },
      include: {
        casts: true,
        genres: true,
      },
    });

    return NextResponse.json(updatedSeason);
  } catch (error) {
    console.log("[SEASON_PATCH]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;

    if (!seasonId) {
      return NextResponse.json("Season ID is required", { status: 400 });
    }

    const season = await db.season.findUnique({
      where: { id: seasonId },
      include: {
        casts: true,
        genres: true,
        episodes: true,
      },
    });

    if (!season) {
      return NextResponse.json("Season not found", { status: 404 });
    }

    return NextResponse.json(season);
  } catch (error) {
    console.log("[SEASON_GET]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;

    if (!seasonId) {
      return NextResponse.json("Season ID is required", { status: 400 });
    }

    await db.season.delete({
      where: { id: seasonId },
    });

    return NextResponse.json({ message: "Season deleted successfully" });
  } catch (error) {
    console.log("[SEASON_DELETE]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
} 