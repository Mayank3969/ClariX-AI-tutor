
import { UserProfile, UserStats, Badge } from "../types";
import { BADGES } from "../data";

/**
 * Checks if the user qualifies for any new badges based on current stats and context.
 * Returns the Badge object if a NEW badge is earned, otherwise null.
 */
export const checkForNewBadges = (
  user: UserProfile,
  stats: UserStats,
  context: {
    topic?: string;
    styleScore?: number;
    difficulty?: string;
  }
): Badge | null => {
  const existingBadges = new Set(user.badges);

  // 1. GRAPH_GOD: Solved 50 Graph problems (Hard).
  // Mock Logic: Check if current topic is Graph and totalSolved is high enough (mock threshold)
  if (!existingBadges.has("GRAPH_GOD")) {
    // In a real app, we check specific problem counts from DB.
    // For this demo: If context topic is Graphs and user has solved > 50 problems in total (proxy metric)
    if (context.topic === "Graphs" && stats.totalSolved > 50) {
       return BADGES.GRAPH_GOD;
    }
  }

  // 2. STREAK_MASTER: 30-day continuous streak.
  if (!existingBadges.has("STREAK_MASTER")) {
    if (stats.streakDays >= 30) {
      return BADGES.STREAK_MASTER;
    }
  }

  // 3. CLEAN_CODER: Avg Style Score > 9.0 on last 20 posts.
  // Mock Logic: If the current submission style score > 9.0
  if (!existingBadges.has("CLEAN_CODER")) {
    if (context.styleScore && context.styleScore >= 9) {
      return BADGES.CLEAN_CODER;
    }
  }

  return null;
};
