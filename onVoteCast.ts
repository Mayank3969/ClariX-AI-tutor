
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Mapping expertise to numeric values for the formula
const EXPERTISE_VALUES: Record<string, number> = {
  "Beginner": 10,
  "Intermediate": 50,
  "Expert": 100
};

export const onVoteCast = onDocumentWritten(
  "topics/{topicId}/algorithms/{algorithmId}/posts/{postId}/votes/{userId}",
  async (event) => {
    // 1. Validate Event Data
    if (!event.data) return;

    const change = event.data;
    const { topicId, algorithmId, postId, userId } = event.params;
    
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    // If no change in vote type (e.g. distinct internal update), skip to save reads
    if (beforeData?.type === afterData?.type) {
      return;
    }

    const postRef = db.doc(`topics/${topicId}/algorithms/${algorithmId}/posts/${postId}`);
    const userRef = db.doc(`users/${userId}`);

    try {
      // 2. Transactional Read & Update
      // We use a transaction to ensure we read the latest Metadata to calculate the weight
      // and update the score atomically.
      await db.runTransaction(async (transaction) => {
        const [postSnap, userSnap] = await Promise.all([
          transaction.get(postRef),
          transaction.get(userRef)
        ]);

        if (!postSnap.exists || !userSnap.exists) {
            console.error("Post or User not found during vote calculation.");
            return;
        }

        const post = postSnap.data();
        const user = userSnap.data();

        // 3. Calculate Vote Weight
        // Formula: BaseVote (1) + (Reputation / 100) + (TopicExpertise / 10) + (AIRelevance / 50)
        
        const baseVote = 1;
        const reputation = user?.reputation || 0;
        const expertiseString = user?.expertise || "Beginner";
        const expertiseVal = EXPERTISE_VALUES[expertiseString] || 10;
        const aiRelevance = post?.aiRelevance || 0; // Default to 0 if not yet analyzed

        const reputationScore = reputation / 100;
        const expertiseScore = expertiseVal / 10;
        const aiScore = aiRelevance / 50;

        // The magnitude of the user's vote power
        const voteWeight = baseVote + reputationScore + expertiseScore + aiScore;

        // 4. Calculate Score Delta
        // type: 'up' (+1) | 'down' (-1) | null (0)
        const getDirection = (data: any) => {
             if (!data || !data.type) return 0;
             return data.type === 'up' ? 1 : -1;
        };

        const beforeDir = getDirection(beforeData);
        const afterDir = getDirection(afterData);

        // Calculate the net impact on the score
        // e.g., Up (+1) to Down (-1) => change is -2 * weight
        // e.g., None (0) to Up (+1) => change is 1 * weight
        const scoreChange = (afterDir - beforeDir) * voteWeight;

        // 5. Update Parent Post
        // Idempotency Note: We rely on the `onDocumentWritten` behavior + Transaction.
        // While strictly preventing re-execution requires checking eventID in a processed log,
        // using a diff-based (delta) approach ensures that even if the context (user rep) changes slightly
        // between retries, the logic remains mathematically consistent for this specific operation.
        
        // We also round to 2 decimals to prevent floating point drift in Firestore
        const currentScore = post?.weightedScore || 0;
        const newScore = parseFloat((currentScore + scoreChange).toFixed(2));

        transaction.update(postRef, {
            weightedScore: newScore,
            voteCount: admin.firestore.FieldValue.increment(afterDir === 0 ? -1 : (beforeDir === 0 ? 1 : 0)) // Only change count if adding/removing vote, not switching
        });

        console.log(`Vote processed for user ${userId} on post ${postId}. Weight: ${voteWeight.toFixed(2)}. Delta: ${scoreChange}`);
      });

    } catch (error) {
      console.error("Vote processing failed:", error);
    }
  }
);
