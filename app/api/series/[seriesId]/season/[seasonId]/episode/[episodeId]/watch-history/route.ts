import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ seriesId: string; episodeId: string }> }
) {
  try {
    const user = await currentUser();
    const { seriesId, episodeId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const history = await db.watchHistory.findMany({
      where: {
        userId: user.id,
        seriesId,
        episodeId,
      },
      include: {
        episode: {
          include: {
            season: true,
          },
        },
        series: true,
      },
      orderBy: { lastWatchedAt: "desc" },
      take: 20,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[WATCH_HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
