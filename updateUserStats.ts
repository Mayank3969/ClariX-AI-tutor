
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already active
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Triggered when a user's problem history document is created or updated.
 * Path: users/{userId}/history/{problemId}
 * 
 * Logic:
 * 1. Detects if a problem was just marked as 'Completed'.
 * 2. Increments 'topicsLearned' (topics encountered) and 'totalSolved'.
 * 3. Updates 'totalAttempted' based on the attempts in the problem doc.
 * 4. Recalculates 'accuracyRate'.
 * 5. If attempts > 3, adds the topic to 'weakAreas'.
 */
export const updateUserStats = onDocumentWritten(
  "users/{userId}/history/{problemId}",
  async (event) => {
    // 1. Validation
    if (!event.data) return;

    const beforeData = event.data.before.exists ? event.data.before.data() : null;
    const afterData = event.data.after.exists ? event.data.after.data() : null;
    const { userId } = event.params;

    // We only care if the problem is now 'Completed'
    const isCompletedNow = afterData?.status === "Completed";
    const wasCompletedBefore = beforeData?.status === "Completed";

    // Skip if it was already completed (prevent double counting) or isn't completed yet
    if (!isCompletedNow || wasCompletedBefore) {
      return;
    }

    const db = admin.firestore();
    const statsRef = db.collection("users").doc(userId).collection("userStats").doc("main");

    const attemptsTaken = afterData?.attempts || 1;
    const topic = afterData?.topic || "General";

    try {
      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        
        // Initialize default stats if document doesn't exist
        const currentStats = statsDoc.exists ? statsDoc.data() : {
          topicsLearned: 0,
          totalSolved: 0,
          totalAttempted: 0,
          accuracyRate: 0,
          weakAreas: []
        };

        // 2. Increment Counters
        // We consider "topicsLearned" as a count of successful modules/problems completed
        const newTopicsLearned = (currentStats?.topicsLearned || 0) + 1;
        const newTotalSolved = (currentStats?.totalSolved || 0) + 1;
        
        // We add the attempts from this specific problem to the global attempts counter
        // Note: Ideally, we track every attempt globally, but here we aggregate on completion
        const newTotalAttempted = (currentStats?.totalAttempted || 0) + attemptsTaken;

        // 3. Recalculate Accuracy Rate
        // Avoid division by zero
        const newAccuracyRate = newTotalAttempted > 0 
          ? (newTotalSolved / newTotalAttempted) * 100 
          : 0;

        // 4. Update Weak Areas
        let weakAreasUpdate = currentStats?.weakAreas || [];
        
        // If it took more than 3 attempts, mark this topic as a weak area
        if (attemptsTaken > 3) {
            // Add if not already present (Client-side usage handles unique sets, 
            // but we ensure it here logic-wise or rely on arrayUnion in the write)
             if (!weakAreasUpdate.includes(topic)) {
                 weakAreasUpdate.push(topic);
             }
        }

        // 5. Commit Updates
        transaction.set(statsRef, {
          topicsLearned: newTopicsLearned,
          totalSolved: newTotalSolved,
          totalAttempted: newTotalAttempted,
          accuracyRate: parseFloat(newAccuracyRate.toFixed(2)), // Keep it clean
          weakAreas: weakAreasUpdate, // If using arrayUnion below, we don't need this, but for transaction set we pass the full array
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      console.log(`Updated stats for user ${userId}. Topic: ${topic}, Attempts: ${attemptsTaken}`);

    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  }
);
