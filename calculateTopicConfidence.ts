
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already active
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Triggered whenever a user completes a quiz, solves a problem, or gets a solution validated.
 * 
 * Implemented trigger: Listens to the 'history' collection for completed problems.
 * Logic:
 * 1. Calculates 'solvedCount' and 'errorRate' from history.
 * 2. Fetches previous confidence to determine 'lastActivityDate' for decay.
 * 3. Applies formulas:
 *    - Base = min(100, solvedCount * 10)
 *    - Decay = 5% reduction per week if inactive > 7 days.
 *    - Penalty = 15% drop if error rate > 40% on recent 5 attempts.
 * 4. Updates users/{uid}/confidence/{topicId}.
 */
export const calculateTopicConfidence = onDocumentWritten(
  "users/{userId}/history/{historyId}",
  async (event) => {
    // 1. Setup & Validation
    const snapshot = event.data;
    if (!snapshot) return; // Handle deletion

    const { userId } = event.params;
    const afterData = snapshot.after.exists ? snapshot.after.data() : null;

    // Only run calculation when a problem is successfully completed
    if (!afterData || afterData.status !== "Completed") {
      return;
    }

    const topicName = afterData.topic || "General";
    // Create a URL-safe document ID for the topic (e.g., "Dynamic Programming" -> "dynamic_programming")
    const topicId = topicName.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    const db = admin.firestore();

    try {
      // 2. Fetch User's History for this Topic
      // We need to query history to calculate strict inputs: solved count & error rate.
      const historySnapshot = await db.collection(`users/${userId}/history`)
        .where("topic", "==", topicName)
        .orderBy("timestamp", "desc") // Recent first
        .get();

      const historyDocs = historySnapshot.docs.map(doc => doc.data());
      
      const solvedCount = historyDocs.filter(d => d.status === "Completed").length;

      // Calculate Error Rate on Recent Attempts (Last 5)
      // "Error" is defined here as needing > 3 attempts to solve.
      const recentAttempts = historyDocs.slice(0, 5);
      const struggleCount = recentAttempts.filter(d => (d.attempts || 1) > 3).length;
      
      const errorRate = recentAttempts.length > 0 
        ? (struggleCount / recentAttempts.length) 
        : 0;

      // 3. Fetch Previous Confidence for Decay Calculation
      const confidenceRef = db.doc(`users/${userId}/confidence/${topicId}`);
      const confidenceDoc = await confidenceRef.get();
      const prevData = confidenceDoc.exists ? confidenceDoc.data() : null;

      // Determine Last Activity Date (from previous record) to calculate decay *before* this new activity
      // If no previous record, we assume no decay (fresh start).
      const lastActivityDate = prevData?.lastUpdated ? prevData.lastUpdated.toDate() : new Date();
      const now = new Date();
      
      // Calculate weeks inactive
      const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      let decayMultiplier = 1.0;
      
      // Decay Factor: If lastActivityDate > 7 days, reduce score by 5% per week.
      if (diffDays > 7) {
        const weeksInactive = Math.floor(diffDays / 7);
        // Cap decay to prevent negative scores (e.g., max 50% decay)
        const decayAmount = Math.min(0.5, weeksInactive * 0.05); 
        decayMultiplier = 1.0 - decayAmount;
      }

      // 4. Calculate Score
      
      // Base Score: Increases with solved problems (Linear growth, capped at 100)
      // Example: 10 problems = 100% mastery base.
      let baseScore = Math.min(100, solvedCount * 10);

      // Apply Decay
      // Note: We apply decay to the calculated base. This represents that even if you solved X problems total,
      // your current "confidence" is lower if you haven't practiced recently.
      let calculatedScore = baseScore * decayMultiplier;

      // Apply Penalty
      // Penalty: If error rate > 40% on recent attempts, drop score by 15%.
      if (errorRate > 0.40) {
        calculatedScore *= 0.85;
      }

      // Round to nearest integer
      const finalScore = Math.round(calculatedScore);

      // 5. Update Confidence Document
      await confidenceRef.set({
        topicName: topicName,
        score: finalScore,
        solvedCount: solvedCount,
        errorRate: parseFloat(errorRate.toFixed(2)),
        decayFactor: parseFloat(decayMultiplier.toFixed(2)),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        analyzedAt: now.toISOString()
      }, { merge: true });

      console.log(`Calculated Confidence for ${userId} [${topicName}]: ${finalScore}% (Base: ${baseScore}, Decay: ${decayMultiplier}, ErrorRate: ${errorRate})`);

    } catch (error) {
      console.error("Error calculating topic confidence:", error);
    }
  }
);
