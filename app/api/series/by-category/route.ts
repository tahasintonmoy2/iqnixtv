import { db } from "@/lib/db";
import { isNewRelease } from "@/lib/new-release-utils";
import { isPopularContent } from "@/lib/popular-content-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    let content;

    // Handle different category types
    switch (category) {
      case "drama":
        // Get series with drama genre
        content = await db.series.findMany({
          where: {
            isPublished: true,
            genre: {
              name: {
                equals: "drama",
                mode: "insensitive",
              },
            },
          },
          include: {
            genre: true,
            contentRating: true,
            episodes: {
              where: {
                isPublished: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: limit,
          orderBy: {
            viewsCount: "desc",
          },
        });
        break;

      case "new":
        // Get recently released content
        content = await db.series.findMany({
          where: {
            isPublished: true,
            releaseDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          include: {
            genre: true,
            contentRating: true,
            episodes: {
              where: {
                isPublished: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: limit,
          orderBy: {
            releaseDate: "desc",
          },
        });
        break;

      case "recommended":
        // Get content with high ratings and views
        content = await db.series.findMany({
          where: {
            isPublished: true,
            contentRating: {
              rating: {
                gte: 4,
              },
            },
          },
          include: {
            genre: true,
            contentRating: true,
            episodes: {
              where: {
                isPublished: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: limit,
          orderBy: [
            { contentRating: { rating: "desc" } }, 
            { viewsCount: "desc" }
          ],
        });
        break;

      case "popular":
        // Get popular content
        content = await db.series.findMany({
          where: {
            isPublished: true,
            isPopular: true,
          },
          include: {
            genre: true,
            contentRating: true,
            episodes: {
              where: {
                isPublished: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: limit,
          orderBy: [
            { viewsCount: "desc" },
            { contentRating: { rating: "desc" } }
          ],
        });
        break;

      default:
        // Get content by specific genre name
        content = await db.series.findMany({
          where: {
            isPublished: true,
            genre: {
              name: {
                equals: category,
                mode: "insensitive",
              },
            },
          },
          include: {
            genre: true,
            contentRating: true,
            episodes: {
              where: {
                isPublished: true,
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          take: limit,
          orderBy: {
            viewsCount: "desc",
          },
        });
    }

    // Transform the data to match the expected format
    const transformedContent = content.map((item) => ({
      id: item.id,
      title: item.name,
      image: item?.thumbnailImageUrl,
      description: item.description,
      genre: item.genre?.name,
      viewsCount: item.viewsCount || 0,
      contentRating: item.contentRating?.rating || 0,
      releaseDate: item.releaseDate,
      episodeCount: item.episodes.length,
      isNewRelease: item.isNewRelease || isNewRelease(item.createdAt, item.releaseDate),
      isPopular: item.isPopular || isPopularContent(item.isPopular, item.viewsCount, item.contentRating?.rating),
      createdAt: item.createdAt,
    }));

    return NextResponse.json(transformedContent);
  } catch (error) {
    console.error("Error fetching content by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
