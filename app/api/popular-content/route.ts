import { db } from "@/lib/db";
import { isPopularContent } from "@/lib/popular-content-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Get popular and trending content
    const popularContent = await db.series.findMany({
      where: {
        isPublished: true,
        OR: [
          { isPopular: true },
          { viewsCount: { gte: 100 } }, // Consider content with 100+ views as popular
        ],
      },
      include: {
        genre: true,
        contentRating: true,
        seasons: {
          where: { isPublished: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      take: limit,
      orderBy: [
        { viewsCount: "desc" },
        { contentRating: { rating: "desc" } },
        { createdAt: "desc" },
      ],
    });

    // Transform results to match the expected format
    const results = popularContent.map((series) => ({
      id: series.id,
      title: series.name,
      type: series.type === "MOVIE" ? "movie" : "drama",
      image: series.thumbnailImageUrl || "/placeholder.svg?height=60&width=60",
      trending: isPopularContent(
        series.isPopular,
        series.viewsCount,
        series.contentRating?.rating
      ),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching popular content:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular content" },
      { status: 500 }
    );
  }
}
