/**
 * Utility functions for calculating trending scores for learning paths
 */

export interface PathMetrics {
  view_count: number | null;
  like_count: number | null;
  fork_count: number | null;
  published_at: string | null;
  created_at: string;
}

/**
 * Calculate trending score for a learning path
 * Formula: (views * 1 + likes * 3 + forks * 5) / days_since_published
 *
 * @param metrics - Engagement metrics for the path
 * @returns Trending score (higher is more trending)
 */
export function calculateTrendingScore(metrics: PathMetrics): number {
  const views = metrics.view_count ?? 0;
  const likes = metrics.like_count ?? 0;
  const forks = metrics.fork_count ?? 0;

  // Calculate engagement score with weighted metrics
  const engagementScore = (views * 1) + (likes * 3) + (forks * 5);

  // Calculate days since published (or created if not published)
  const publishDate = metrics.published_at
    ? new Date(metrics.published_at)
    : new Date(metrics.created_at);

  const now = new Date();
  const daysSincePublished = Math.max(
    (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24),
    0.1 // Minimum 0.1 days to avoid division by zero
  );

  // Calculate trending score
  return engagementScore / daysSincePublished;
}

/**
 * Sort paths by trending score
 *
 * @param paths - Array of paths with metrics
 * @returns Sorted array (highest trending score first)
 */
export function sortByTrending<T extends PathMetrics>(paths: T[]): T[] {
  return [...paths].sort((a, b) => {
    const scoreA = calculateTrendingScore(a);
    const scoreB = calculateTrendingScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Filter paths published within a time window
 *
 * @param paths - Array of paths
 * @param daysAgo - Number of days to look back
 * @returns Filtered array of recent paths
 */
export function filterRecentPaths<T extends PathMetrics>(
  paths: T[],
  daysAgo: number = 30
): T[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  return paths.filter(path => {
    const publishDate = path.published_at
      ? new Date(path.published_at)
      : new Date(path.created_at);
    return publishDate >= cutoffDate;
  });
}

/**
 * Get top trending paths
 *
 * @param paths - Array of paths with metrics
 * @param limit - Number of top paths to return
 * @param daysAgo - Only consider paths from last N days
 * @returns Array of top trending paths
 */
export function getTopTrending<T extends PathMetrics>(
  paths: T[],
  limit: number = 5,
  daysAgo: number = 30
): T[] {
  const recentPaths = filterRecentPaths(paths, daysAgo);
  const sorted = sortByTrending(recentPaths);
  return sorted.slice(0, limit);
}
