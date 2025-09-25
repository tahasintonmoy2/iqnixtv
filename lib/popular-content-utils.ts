/**
 * Utility functions for determining popular content based on various criteria
 */

import { getPopularContentConfig, PopularContentConfig } from "@/config/popular-content";

export type { PopularContentConfig };

export const DEFAULT_POPULAR_CONFIG: PopularContentConfig = getPopularContentConfig();

/**
 * Determines if content should be marked as popular based on various criteria
 * @param isPopular - The static isPopular field from database
 * @param viewsCount - The number of views
 * @param rating - The content rating
 * @param config - Configuration for popular content logic
 * @returns boolean indicating if content is popular
 */
export function isPopularContent(
  isPopular: boolean | null | undefined,
  viewsCount: number | null | undefined,
  rating: number | null | undefined,
  config: PopularContentConfig = DEFAULT_POPULAR_CONFIG
): boolean {
  // If static field is enabled and set to true, always return true
  if (config.useStaticField && isPopular) {
    return true;
  }

  // If static field is disabled or false, check dynamic criteria
  if (!config.useStaticField || !isPopular) {
    let meetsCriteria = true;

    // Check views count if enabled
    if (config.considerViews && (viewsCount || 0) < config.minViewsCount) {
      meetsCriteria = false;
    }

    // Check rating if enabled
    if (config.considerRating && (rating || 0) < config.minRating) {
      meetsCriteria = false;
    }

    return meetsCriteria;
  }

  return false;
}

/**
 * Gets a popularity score based on views and rating
 * @param viewsCount - The number of views
 * @param rating - The content rating
 * @returns popularity score (0-100)
 */
export function getPopularityScore(
  viewsCount: number | null | undefined,
  rating: number | null | undefined
): number {
  const views = viewsCount || 0;
  const ratingValue = rating || 0;

  // Normalize views (assuming max views around 100k for scoring)
  const normalizedViews = Math.min(views / 1000, 100);
  
  // Rating is already 0-5, convert to 0-100
  const normalizedRating = (ratingValue / 5) * 100;

  // Weighted average: 70% views, 30% rating
  return Math.round((normalizedViews * 0.7) + (normalizedRating * 0.3));
}

/**
 * Gets a human-readable popularity level
 * @param score - The popularity score (0-100)
 * @returns string like "Very Popular", "Popular", "Trending", etc.
 */
export function getPopularityLevel(score: number): string {
  if (score >= 80) return "Very Popular";
  if (score >= 60) return "Popular";
  if (score >= 40) return "Trending";
  if (score >= 20) return "Rising";
  return "New";
}
