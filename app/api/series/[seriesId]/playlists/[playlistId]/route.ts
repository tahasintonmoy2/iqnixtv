import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request
) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { playlistId } = body;

    if (!playlistId) {
      return NextResponse.json("Playlist ID is required", { status: 400 });
    }

    const deletePlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return NextResponse.json(deletePlaylist);
  } catch (error) {
    console.error("[PLAYLISTS_PATCH]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
