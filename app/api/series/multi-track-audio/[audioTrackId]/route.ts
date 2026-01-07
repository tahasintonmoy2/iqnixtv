import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ audioTrackId: string }> }
) {
  try {
    const user = await currentUser();
    const { audioTrackId } = await params;

    if (!user?.id || user.role !== "ADMIN") {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!audioTrackId) {
      return NextResponse.json(
        { error: "Missing required fields: name, fileUrl, languageCode" },
        { status: 400 }
      );
    }

    const deleteTrack = await db.audioTrack.delete({
      where: {
        id: audioTrackId,
      },
    });

    return NextResponse.json(deleteTrack);
  } catch (error) {
    console.log("Delete failed", error);
  }
}
