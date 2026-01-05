
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled Cloud Function: calculateTopicLeaders
 * Runs every Sunday at 00:00 UTC.
 * 
 * Logic:
 * 1. Iterates through all topics.
 * 2. Aggregates contributions (scores) from posts created in the last 30 days.
 * 3. Updates the weekly leaderboard for each topic.
 * 4. Assigns 'Topic Expert' role to the #1 user.
 */
export const calculateTopicLeaders = onSchedule("every sunday 00:00", async (event) => {
  const db = admin.firestore();
  
  // Define time range: Last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startTimestamp = admin.firestore.Timestamp.fromDate(thirtyDaysAgo);

  try {
    // 1. Fetch all topics
    // Assumes a root collection 'topics' exists.
    const topicsSnapshot = await db.collection("topics").get();

    for (const topicDoc of topicsSnapshot.docs) {
      const topicId = topicDoc.id;
      
      // 2. Aggregate User Contributions
      // Query posts for this topic created within the last 30 days
      // Note: This requires a composite index on [topicId ASC, createdAt ASC/DESC]
      const postsSnapshot = await db.collectionGroup("posts")
        .where("topicId", "==", topicId)
        .where("createdAt", ">=", startTimestamp)
        .get();

      const userScores: Record<string, number> = {};

      postsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Fallback for author ID field name depending on implementation
        const userId = data.authorId || data.uid;
        
        if (!userId) return;

        // Calculate Score:
        // Base: weightedScore (derived from votes and AI relevance)
        // Bonus: +10 if the solution was marked as VERIFIED by AI
        let score = (data.weightedScore || 0);
        if (data.validationStatus === "VERIFIED") {
            score += 10;
        }
        
        userScores[userId] = (userScores[userId] || 0) + score;
      });

      // 3. Identify Top 3 Users
      const topUsers = Object.entries(userScores)
        .map(([userId, score]) => ({ userId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (topUsers.length === 0) continue;

      // 4. Update Leaderboard Document
      // Path: topics/{topicId}/leaderboard/weekly
      await db.doc(`topics/${topicId}/leaderboard/weekly`).set({
        leaders: topUsers,
        periodStart: startTimestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Updated leaderboard for topic ${topicId}. Top Score: ${topUsers[0].score}`);

      // 5. Assign 'Topic Expert' Role to #1 User
      const topUser = topUsers[0];
      if (topUser && topUser.score > 0) {
          const userRef = db.collection("users").doc(topUser.userId);
          await userRef.update({
              roles: admin.firestore.FieldValue.arrayUnion("Topic Expert"),
              // Optional: Track specifically which topic they are an expert in
              expertTopics: admin.firestore.FieldValue.arrayUnion(topicId)
          });
          console.log(`Promoted user ${topUser.userId} to Topic Expert.`);
      }
    }
  } catch (error) {
    console.error("Error calculating topic leaders:", error);
  }
});
