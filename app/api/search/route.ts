import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchQuery = query.trim();

    // Search across series, cast, and genres
    const [seriesResults, castResults, genreResults] = await Promise.all([
      // Search series
      db.series.findMany({
        where: {
          AND: [
            { isPublished: true },
            {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: {
          genre: true,
          contentRating: true,
          seasons: {
            where: { isPublished: true },
            include: {
              episodes: {
                where: { isPublished: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          casts: {
            take: 3,
          },
        },
        take: Math.ceil(limit * 0.6), // 60% of results
        orderBy: [
          { viewsCount: "desc" },
          { contentRating: { rating: "desc" } },
        ],
      }),

      // Search cast members
      db.cast.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { alsoKnownAs: { contains: searchQuery, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: {
          series: {
            where: { isPublished: true },
            take: 1,
          },
        },
        take: Math.ceil(limit * 0.2), // 20% of results
        orderBy: { name: "asc" },
      }),

      // Search genres
      db.genre.findMany({
        where: {
          name: { contains: searchQuery, mode: "insensitive" },
        },
        include: {
          series: {
            where: { isPublished: true },
            take: 1,
          },
        },
        take: Math.ceil(limit * 0.2), // 20% of results
        orderBy: { name: "asc" },
      }),
    ]);

    // Transform results to match the expected format
    const results = [
      // Series results
      ...seriesResults.map((series) => ({
        id: series.id,
        title: series.name,
        type: series.type === "MOVIE" ? "movie" as const : "drama" as const,
        image: series.thumbnailImageUrl || "/placeholder.svg?height=300&width=200",
        year: series.releaseDate ? new Date(series.releaseDate).getFullYear().toString() : undefined,
        rating: series.contentRating?.rating,
        description: series.description,
        episodes: series.seasons?.reduce((total, season) => total + (season.episodes?.length || 0), 0) || 0,
        cast: series.casts?.slice(0, 3).map(cast => cast.name) || [],
      })),

      // Cast results
      ...castResults.map((cast) => ({
        id: cast.id,
        title: cast.name,
        type: "actor" as const,
        image: cast.image || "/placeholder.svg?height=300&width=200",
        description: cast.bio || `${cast.career} from ${cast.region}`,
      })),

      // Genre results
      ...genreResults.map((genre) => ({
        id: genre.id,
        title: genre.name,
        type: "genre" as const,
        description: `Content in the ${genre.name} category`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
