/**
 * Configuration for new release detection
 */

export interface NewReleaseConfig {
  /** Number of days to consider content as "new" */
  newReleaseDays: number;
  /** Whether to use createdAt or releaseDate for comparison */
  useCreatedAt: boolean;
  /** Whether to show time ago information */
  showTimeAgo: boolean;
}

export const NEW_RELEASE_CONFIG: NewReleaseConfig = {
  newReleaseDays: 30, // Content is considered "new" for 30 days
  useCreatedAt: true, // Use creation date instead of release date
  showTimeAgo: false, // Don't show "X days ago" by default
};

/**
 * Environment-specific configuration
 * You can override these values using environment variables
 */
export function getNewReleaseConfig(): NewReleaseConfig {
  return {
    newReleaseDays: parseInt(process.env.NEW_RELEASE_DAYS || NEW_RELEASE_CONFIG.newReleaseDays.toString()),
    useCreatedAt: process.env.USE_CREATED_AT === 'false' ? false : NEW_RELEASE_CONFIG.useCreatedAt,
    showTimeAgo: process.env.SHOW_TIME_AGO === 'true' ? true : NEW_RELEASE_CONFIG.showTimeAgo,
  };
}
