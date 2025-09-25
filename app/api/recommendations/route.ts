import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RecommendationService } from "@/lib/recommendation-service";
import { NextResponse } from "next/server";

const recommendationService = new RecommendationService();

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "mixed";
    const limit = parseInt(searchParams.get("limit") || "10");

    let recommendations;

    switch (type) {
      case "content-based":
        recommendations =
          await recommendationService.getContentBasedRecommendations(
            user.id,
            limit
          );
        break;
      case "collaborative":
        recommendations =
          await recommendationService.getCollaborativeRecommendations(
            user.id,
            limit
          );
        break;
      case "popular":
        recommendations = await recommendationService.getPopularRecommendations(
          user.id,
          limit
        );
        break;
      case "continue-watching":
        recommendations =
          await recommendationService.getContinueWatchingRecommendations(
            user.id,
            limit
          );
        break;

      case "mixed":
      default:
        recommendations = await recommendationService.getMixedRecommendations(
          user.id
        );
        break;
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seriesId, eventType = "VIEW", properties } = body;

    await recommendationService.updateUserPreferences(user.id, seriesId);

    if (eventType === "WATCH_PROGRESS" || eventType === "COMPLETE") {
      const { episodeId, currentTime = 0, duration = 0} = properties || [];
      if (episodeId) {
        const progressPercent = duration > 0 ? Math.floor(currentTime / duration) : 0;

        await db.watchHistory.upsert({
          where: {
            userId_episodeId: {
              userId: user.id,
              episodeId
            }
          },
          create: {
            userId: user.id,
            episodeId,
            seriesId,
            currentTime: Math.round(currentTime),
            duration: Math.round(duration),
            progressPercent,
            isCompleted: eventType === "COMPLETE" || progressPercent >= 0.95
          },
          update: {
            currentTime: Math.round(currentTime),
            duration: Math.round(duration),
            progressPercent,
            lastWatchedAt: new Date(),
            isCompleted: eventType === "COMPLETE" || progressPercent >= 0.95
          }
        })
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
