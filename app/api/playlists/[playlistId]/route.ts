import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  params: Promise<{ playlistId: string }>
) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, seriesId } = body;
    const { playlistId } = await params;

    if (!seriesId) {
      return new NextResponse("Series ID is required", { status: 400 });
    }

    const existPlaylist = await db.playlist.findFirst({
      where: {
        id: playlistId,
        userId: user.id,
      },
    });

    if (!existPlaylist) {
      return NextResponse.json("Playlist not found", { status: 404 });
    }

    const existingContent = await db.playlistContent.findFirst({
      where: {
        playlistId,
        seriesId,
      },
    });

    if (existingContent) {
      return NextResponse.json(
        { error: "This item is already in the playlist" },
        { status: 409 }
      );
    }

    await db.playlistContent.create({
      data: {
        playlistId,
        seriesId,
        userId: user.id,
        order: 0,
      },
    });

    const playlist = await db.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        name,
        description: description || "",
        itemCount: {
          increment: 1,
        },
        duration: 0,
        userId: user.id,
        lastUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("[PLAYLISTS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
