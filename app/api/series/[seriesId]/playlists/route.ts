import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, seriesId } = body;

    const playlist = await db.playlist.create({
      data: {
        name,
        description: description || "",
        itemCount: seriesId ? 1 : 0,
        userId: user.id,
      },
    });

    if (seriesId) {
      try {
        await db.playlistContent.create({
          data: {
            playlistId: playlist.id,
            seriesId,
            userId: user.id,
          },
        });
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002"
        ) {
          return NextResponse.json(
            { error: "This item is already in the playlist" },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("[PLAYLISTS_POST]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const playlists = await db.playlist.findMany({
      where: {
        userId: user.id,
      },
      include: {
        contents: {
          include: {
            series: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error("[PLAYLISTS_GET]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
