
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled Cloud Function: aggregateDailyStats
 * Runs every day at 23:59 to aggregate key platform metrics.
 * 
 * Metrics:
 * - activeUsers: Count of users active today.
 * - totalSolves: Count of problems solved today.
 * - aiAccuracy: Average relevance score of posts analyzed today.
 * - misleadingPosts: Count of posts flagged as containing misconceptions today.
 */
export const aggregateDailyStats = onSchedule("every day 23:59", async (event) => {
  const db = admin.firestore();
  
  // Calculate time range for "Today"
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);

  console.log(`Aggregating stats for date: ${now.toISOString().split('T')[0]}`);

  try {
    // 1. Active Users (lastActive >= startOfDay)
    // Note: Requires 'lastActive' to be updated by client/auth triggers
    const activeUsersSnap = await db.collection("users")
      .where("lastActive", ">=", startTimestamp)
      .count()
      .get();
    
    const activeUsers = activeUsersSnap.data().count;

    // 2. Total Solves (status == 'Completed' in history subcollections)
    // Note: collectionGroup query requires an index on 'status' and 'timestamp'
    const solvesSnap = await db.collectionGroup("history")
      .where("status", "==", "Completed")
      .where("timestamp", ">=", startTimestamp)
      .count()
      .get();

    const totalSolves = solvesSnap.data().count;

    // 3. AI Accuracy & Misleading Posts
    // Query all posts analyzed today
    const postsSnap = await db.collectionGroup("posts")
      .where("analyzedAt", ">=", startTimestamp)
      .select("aiRelevance", "hasMisconception")
      .get();

    let totalRelevance = 0;
    let analyzedCount = 0;
    let misleadingCount = 0;

    postsSnap.forEach((doc) => {
      const data = doc.data();
      
      // Accumulate Relevance
      if (typeof data.aiRelevance === "number") {
        totalRelevance += data.aiRelevance;
        analyzedCount++;
      }

      // Count Misleading
      if (data.hasMisconception === true) {
        misleadingCount++;
      }
    });

    const aiAccuracy = analyzedCount > 0 
      ? parseFloat((totalRelevance / analyzedCount).toFixed(2)) 
      : 0;

    // 4. Save to stats_daily collection
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    
    await db.collection("stats_daily").doc(dateStr).set({
      date: dateStr,
      activeUsers,
      totalSolves,
      aiAccuracy,
      misleadingPosts: misleadingCount,
      aggregatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Stats saved for ${dateStr}: Active=${activeUsers}, Solves=${totalSolves}, Accuracy=${aiAccuracy}, Misleading=${misleadingCount}`);

  } catch (error) {
    console.error("Error aggregating daily stats:", error);
  }
});
