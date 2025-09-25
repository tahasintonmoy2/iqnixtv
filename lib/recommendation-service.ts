import { AWSPersonalizeService, PersonalizeRecommendation } from "./aws-personalize-service";
import { db } from "./db";

export interface RecommendationResult {
  contentId: string;
  name: string;
  score: number;
  reason: string;
  thumbnailImageUrl: string | null;
  genre: string[];
  averageRating?: number;
  type: string | null;
}

export class RecommendationService {
  private personalizeService: AWSPersonalizeService;

  constructor() {
    this.personalizeService = new AWSPersonalizeService();
  }

  private static extractGenreNames(
    genre:
      | { name: string }
      | { name: string }[]
      | null
      | undefined
  ): string[] {
    if (!genre) return [];
    return Array.isArray(genre) ? genre.map((g: { name: string }) => g.name) : [genre.name];
  }

  async getContentBasedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      const recommendations = await this.personalizeService.getRecommendations(
        userId,
        process.env.PERSONALIZE_RECOMMENDATIONS_CAMPAIGN_ARN!,
        limit
      );

      return await this.enrichRecommendations(recommendations);
    } catch (error) {
      console.error('Error getting content-based recommendations:', error);
      return this.getFallbackRecommendations(userId, limit);
    }
  }

  async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      const recommendations = await this.personalizeService.getRecommendations(
        userId,
        process.env.PERSONALIZE_SIMILAR_ITEMS_CAMPAIGN_ARN!,
        limit
      );

      return await this.enrichRecommendations(recommendations);
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return this.getFallbackRecommendations(userId, limit);
    }
  }

  async getPersonalizedRanking(
    userId: string,
    itemIds: string[],
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    try {
      const recommendations = await this.personalizeService.getPersonalizedRanking(
        userId,
        itemIds,
        process.env.PERSONALIZE_PERSONALIZED_RANKING_CAMPAIGN_ARN!
      );

      return await this.enrichRecommendations(recommendations.slice(0, limit));
    } catch (error) {
      console.error('Error getting personalized ranking:', error);
      return this.getFallbackRecommendations(userId, limit);
    }
  }

  async getContinueWatchingRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    // Keep existing logic for continue watching as it's based on local watch history
    const incompleteWatches = await db.watchHistory.findMany({
      where: {
        userId,
        isCompleted: false,
        progressPercent: { gt: 0.05 },
      },
      include: {
        episode: {
          include: {
            series: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
      orderBy: { lastWatchedAt: "desc" },
      take: limit,
    });

    return incompleteWatches.map((watch) => {
      const episode = watch.episode;
      const seriesWithOptionalGenre = (episode?.series as unknown as {
        genre?: { name: string } | { name: string }[];
        thumbnailImageUrl?: string | null;
        type?: string | null;
      }) || undefined;
      const genres = RecommendationService.extractGenreNames(seriesWithOptionalGenre?.genre);

      return {
        contentId: watch.episodeId,
        name: episode?.name || "",
        score: 1 - watch.progressPercent,
        reason: `${Math.round(watch.progressPercent * 100)}% watched`,
        thumbnailImageUrl: seriesWithOptionalGenre?.thumbnailImageUrl || null,
        genre: genres,
        type: seriesWithOptionalGenre?.type || null,
      };
    });
  }

  async getMixedRecommendations(userId: string): Promise<{
    continueWatching: RecommendationResult[];
    forYou: RecommendationResult[];
    trending: RecommendationResult[];
    becauseYouWatched: RecommendationResult[];
  }> {
    const [continueWatching, forYou, trending, becauseYouWatched] =
      await Promise.all([
        this.getContinueWatchingRecommendations(userId, 5),
        this.getContentBasedRecommendations(userId, 10),
        this.getPopularRecommendations(userId, 8),
        this.getCollaborativeRecommendations(userId, 6),
      ]);

    return {
      continueWatching,
      forYou,
      trending,
      becauseYouWatched,
    };
  }

  private async enrichRecommendations(
    recommendations: PersonalizeRecommendation[]
  ): Promise<RecommendationResult[]> {
    const itemIds = recommendations.map(r => r.itemId);
    
    // Fetch content details from database
    const content = await db.series.findMany({
      where: { id: { in: itemIds } },
      include: { genre: true },
    });

    const contentMap = new Map(content.map(c => [c.id, c]));

    return recommendations
      .map(rec => {
        const contentItem = contentMap.get(rec.itemId);
        if (!contentItem) return null;

        return {
          contentId: contentItem.id,
          name: contentItem.name,
          score: rec.score || 0,
          reason: "Recommended for you",
          thumbnailImageUrl: contentItem.thumbnailImageUrl,
          genre: RecommendationService.extractGenreNames(
            (contentItem as unknown as { genre?: { name: string } | { name: string }[] }).genre
          ),
          type: contentItem.type,
        };
      })
      .filter(Boolean) as RecommendationResult[];
  }

  private async getFallbackRecommendations(
    userId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Fallback to popular content if AWS Personalize fails
    return this.getPopularRecommendations(userId, limit);
  }

  async getPopularRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    const watchedContentIds = await db.watchHistory.findMany({
      where: { userId },
      select: { episodeId: true },
    });

    const content = await db.series.findMany({
      where: {
        isPopular: true,
        episodes: {
          none: {
            id: { in: watchedContentIds.map((w) => w.episodeId) },
          },
        },
      },
      include: { genre: true },
      orderBy: { viewsCount: "desc" },
      take: limit,
    });

    return content.map((item) => ({
      contentId: item.id,
      name: item.name,
      score: item.viewsCount || 0,
      reason: "Trending now",
      thumbnailImageUrl: item.thumbnailImageUrl || null,
      genre: RecommendationService.extractGenreNames(
        (item as unknown as { genre?: { name: string } | { name: string }[] }).genre
      ),
      type: item.type,
    }));
  }

  async updateUserPreferences(
    userId: string,
    contentId: string
  ): Promise<void> {
    // Track user interaction with AWS Personalize
    await this.personalizeService.trackUserInteraction(
      userId,
      contentId,
      'VIEW'
    );
  }
}