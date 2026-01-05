
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to generate personalized LeetCode problem recommendations.
 * Triggered whenever the user's root document (containing topicStats) is updated.
 */
export const generateRecommendations = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const beforeData = snapshot.before.exists ? snapshot.before.data() : null;
    const afterData = snapshot.after.exists ? snapshot.after.data() : null;
    const { userId } = event.params;

    if (!afterData) return;

    // Only trigger if topicStats has changed
    const statsBefore = JSON.stringify(beforeData?.topicStats || {});
    const statsAfter = JSON.stringify(afterData.topicStats || {});
    
    if (statsBefore === statsAfter && beforeData !== null) {
      console.log("topicStats unchanged for user", userId);
      return;
    }

    const topicStats: Record<string, number> = afterData.topicStats || {};
    const expertise = afterData.expertise || "Beginner";
    const targetRole = afterData.targetRole || "SDE";
    const preferredLanguage = afterData.preferredLanguage || "Python";

    // 1. Determine Strong vs Weak Topics based on solve counts
    // Logic: Strong > 15, Weak < 5.
    const strongTopics = Object.entries(topicStats)
      .filter(([_, count]) => count >= 15)
      .map(([id]) => id);
    
    const weakTopics = Object.entries(topicStats)
      .filter(([_, count]) => count < 5)
      .map(([id]) => id);

    // If no weak topics found yet (new user), use common foundational topics
    const candidates = weakTopics.length > 0 ? weakTopics : ["arrays-hashing", "two-pointers"];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          User Profile:
          - Expertise: ${expertise}
          - Target Role: ${targetRole}
          - Preferred Language: ${preferredLanguage}
          - Strong in: ${strongTopics.join(", ") || "None yet"}
          - Weak in: ${candidates.join(", ")}
          
          Task: Recommend exactly 3 specific LeetCode problems the user should solve next.
          
          Rules:
          1. Prioritize problems from the "Weak" topics.
          2. Difficulty should be ${expertise === "Beginner" ? "Easy" : "Easy/Medium"}.
          3. Explain WHY you chose each. If possible, bridge a strong skill to a weak topic (e.g., "This Array problem uses a HashMap, which you are good at").
          4. Ensure the problems are well-known standard LeetCode problems.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                    topic: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    leetcodeUrl: { type: Type.STRING }
                  },
                  required: ["title", "difficulty", "topic", "reason"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const data = JSON.parse(response.text);

      // 2. Save output to users/{uid}/recommendations/current
      const db = admin.firestore();
      await db.collection("users").doc(userId).collection("recommendations").doc("current").set({
        list: data.recommendations,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        basedOn: {
          strong: strongTopics,
          weak: candidates
        }
      });

      console.log(`Generated 3 recommendations for user ${userId}`);

    } catch (error) {
      console.error("Recommendation Generation Failed:", error);
    }
  }
);
