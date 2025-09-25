/**
 * Configuration for popular content detection
 */

export interface PopularContentConfig {
  /** Minimum views count to consider content popular */
  minViewsCount: number;
  /** Minimum rating to consider content popular */
  minRating: number;
  /** Whether to use static isPopular field */
  useStaticField: boolean;
  /** Whether to consider views count in popularity calculation */
  considerViews: boolean;
  /** Whether to consider rating in popularity calculation */
  considerRating: boolean;
}

export const POPULAR_CONTENT_CONFIG: PopularContentConfig = {
  minViewsCount: 1000, // Minimum views to be considered popular
  minRating: 4.0, // Minimum rating to be considered popular
  useStaticField: true, // Use the static isPopular field
  considerViews: true, // Consider views count in popularity calculation
  considerRating: true, // Consider rating in popularity calculation
};

/**
 * Environment-specific configuration
 * You can override these values using environment variables
 */
export function getPopularContentConfig(): PopularContentConfig {
  return {
    minViewsCount: parseInt(process.env.MIN_VIEWS_FOR_POPULAR || POPULAR_CONTENT_CONFIG.minViewsCount.toString()),
    minRating: parseFloat(process.env.MIN_RATING_FOR_POPULAR || POPULAR_CONTENT_CONFIG.minRating.toString()),
    useStaticField: process.env.USE_STATIC_POPULAR_FIELD === 'false' ? false : POPULAR_CONTENT_CONFIG.useStaticField,
    considerViews: process.env.CONSIDER_VIEWS_FOR_POPULAR === 'false' ? false : POPULAR_CONTENT_CONFIG.considerViews,
    considerRating: process.env.CONSIDER_RATING_FOR_POPULAR === 'false' ? false : POPULAR_CONTENT_CONFIG.considerRating,
  };
}
