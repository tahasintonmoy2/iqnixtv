/**
 * Utility functions for determining new releases based on creation date
 */

import { getNewReleaseConfig, NewReleaseConfig } from "@/config/new-release";

export type { NewReleaseConfig };

export const DEFAULT_NEW_RELEASE_CONFIG: NewReleaseConfig = getNewReleaseConfig();

/**
 * Determines if content should be marked as a new release based on its creation date
 * @param createdAt - The creation date of the content
 * @param releaseDate - The release date of the content (optional)
 * @param config - Configuration for new release logic
 * @returns boolean indicating if content is a new release
 */
export function isNewRelease(
  createdAt: Date,
  releaseDate?: Date | null,
  config: NewReleaseConfig = DEFAULT_NEW_RELEASE_CONFIG
): boolean {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() - config.newReleaseDays * 24 * 60 * 60 * 1000);
  
  // Use the appropriate date based on configuration
  const comparisonDate = config.useCreatedAt ? createdAt : (releaseDate || createdAt);
  
  return comparisonDate >= thresholdDate;
}

/**
 * Calculates the number of days since creation
 * @param createdAt - The creation date
 * @returns number of days since creation
 */
export function getDaysSinceCreation(createdAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets a human-readable string for how long ago content was created
 * @param createdAt - The creation date
 * @returns string like "2 days ago", "1 week ago", etc.
 */
export function getTimeAgoString(createdAt: Date): string {
  const days = getDaysSinceCreation(createdAt);
  
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
}
