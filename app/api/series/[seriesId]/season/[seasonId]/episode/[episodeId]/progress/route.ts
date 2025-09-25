import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const user = await currentUser();
    const { isCompleted } = await req.json();
    const { episodeId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId: user.id,
        episodeId,
        isCompleted,
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ episodeId: string; seriesId: string; seasonId: string }>;
  }
) {
  try {
    const user = await currentUser();
    const { currentTime, duration, progressPercent, isCompleted } =
      await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { episodeId, seriesId, seasonId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingEpisode = await db.episode.findUnique({
      where: {
        id: episodeId,
      },
    });

    if (!existingEpisode) {
      return NextResponse.json("No episode found", { status: 404 });
    }

    const watchHistory = await db.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId,
        },
      },
      update: {
        currentTime,
        duration,
        progressPercent,
        isCompleted,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: user.id,
        episodeId,
        seriesId,
        currentTime,
        duration,
        progressPercent,
        isCompleted,
        lastWatchedAt: new Date(),
        firstWatchedAt: new Date(),
      },
      include: {
        episode: {
          include: {
            season: true,
          },
        },
        series: true,
      },
    });

    return NextResponse.json(watchHistory);
  } catch (error) {
    console.log("[PROGRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const user = await currentUser();
    const { episodeId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const progress = await db.watchHistory.findUnique({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId,
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
