
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled Cloud Function: scanUserWeaknesses
 * Runs daily at midnight to analyze user problem history for recurrent failure patterns.
 * 
 * Logic:
 * 1. Iterates through all users.
 * 2. Fetches 'history' subcollection for each user.
 * 3. Counts failures related to TLE (Time Limit Exceeded) and Edge Cases (0, -1, null, []).
 * 4. Pushes a notification if thresholds (>3 failures) are met.
 */
export const scanUserWeaknesses = onSchedule("every day 00:00", async (event) => {
  const db = admin.firestore();
  
  try {
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const historyRef = db.collection(`users/${userId}/history`);
      
      // Optimization: Limit to recent 20 attempts to ensure relevance and reduce read costs
      const historySnapshot = await historyRef
        .orderBy("timestamp", "desc")
        .limit(20)
        .get();

      if (historySnapshot.empty) continue;

      let edgeCaseFailures = 0;
      let tleFailures = 0;
      const tleTopics: Record<string, number> = {};

      historySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        
        // Skip successful submissions
        if (data.status === "Completed" || data.status === "Accepted") return;

        // 1. Check for TLE
        const isTLE = 
            data.status === "Time Limit Exceeded" || 
            (data.failureReason && data.failureReason.includes("Time Limit"));

        if (isTLE) {
          tleFailures++;
          const topic = data.topic || "General";
          tleTopics[topic] = (tleTopics[topic] || 0) + 1;
        }

        // 2. Check for Edge Case Failures
        // Convert input to string to check for common edge case patterns
        const inputStr = JSON.stringify(data.testCase || data.input || "");
        if (
            inputStr.includes("0") || 
            inputStr.includes("-1") || 
            inputStr.includes("null") || 
            inputStr.includes("[]") ||
            inputStr.includes("undefined")
        ) {
          edgeCaseFailures++;
        }
      });

      // 3. Action: Push Notifications
      const notificationsRef = db.collection(`users/${userId}/notifications`);

      // Pattern: Consistent TLE
      if (tleFailures > 3) {
        // Identify the most problematic topic for TLE
        const topTleTopic = Object.keys(tleTopics).reduce((a, b) => 
            tleTopics[a] > tleTopics[b] ? a : b
        , "General");

        await notificationsRef.add({
          type: "weakness_alert",
          message: `You consistently hit TLE on ${topTleTopic} problems. Review BFS optimizations or Dynamic Programming state reduction.`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Pushed TLE alert for user ${userId} on topic ${topTleTopic}`);
      }

      // Pattern: Edge Case Neglect
      if (edgeCaseFailures > 3) {
        await notificationsRef.add({
          type: "weakness_alert",
          message: "High failure rate detected on edge cases (0, -1, null, []). Consider adding strict boundary checks at the start of your functions.",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Pushed Edge Case alert for user ${userId}`);
      }
    }
  } catch (error) {
    console.error("Error scanning user weaknesses:", error);
  }
});
