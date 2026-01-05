
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Firebase Admin if not already active
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Shared helper function to evaluate text content using Gemini.
 * Returns classification scores for Toxicity and Spam.
 */
const evaluateSafety = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are a Content Moderator AI. Analyze the following text.
      
      Definitions:
      - Toxicity: Harassment, hate speech, bullying, severe profanity, or threats.
      - Spam: Gibberish, repeated text, promotional links, bots, or nonsensical content.

      Text to Analyze:
      "${text}"

      Task: Return a JSON object with scores from 0.0 (Safe) to 1.0 (Severe).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          toxicityScore: { type: Type.NUMBER, description: "0.0 to 1.0" },
          spamScore: { type: Type.NUMBER, description: "0.0 to 1.0" },
        },
        required: ["toxicityScore", "spamScore"],
      },
    },
  });

  if (!response.text) throw new Error("Empty response from AI");
  return JSON.parse(response.text);
};

/**
 * Shared logic to apply moderation actions based on scores.
 */
const applyModerationActions = async (snapshot: any, contextStr: string) => {
  const data = snapshot.data();
  
  // Combine potential text fields (title, body, comment text, code snippets)
  const contentToScan = `
    ${data.title || ""} 
    ${data.postContent || data.text || data.content || ""} 
    ${data.code || ""}
  `.trim();

  if (!contentToScan) return; // Nothing to scan

  try {
    const scores = await evaluateSafety(contentToScan);
    const { toxicityScore, spamScore } = scores;

    console.log(`Moderation Scan [${contextStr}]: Toxicity=${toxicityScore}, Spam=${spamScore}`);

    // ACTION 1: High Toxicity -> DELETE IMMEDIATELY
    if (toxicityScore > 0.8) {
      console.warn(`INCIDENT LOG: content ${snapshot.id} deleted. Toxicity: ${toxicityScore}. Content excerpt: ${contentToScan.substring(0, 50)}...`);
      await snapshot.ref.delete();
      
      // Optionally create a separate log entry in a 'moderation_logs' collection
      const db = admin.firestore();
      await db.collection("moderation_logs").add({
        originalId: snapshot.id,
        contentSnippet: contentToScan.substring(0, 200),
        reason: "Toxic",
        scores,
        deletedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }

    // ACTION 2: High Spam -> SHADOWBAN
    if (spamScore > 0.8) {
      console.log(`Shadowbanning content ${snapshot.id} due to Spam score: ${spamScore}`);
      await snapshot.ref.update({
        shadowBanned: true,
        status: "flagged",
        safetyScores: scores,
        moderatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }

    // ACTION 3: Clean -> PUBLISH
    await snapshot.ref.update({
      status: "published",
      safetyScores: scores,
      moderatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error(`Error moderating ${contextStr}:`, error);
    // Fail Open (Publish) or Fail Closed (Flag)? 
    // Usually safer to flag for manual review if AI fails.
    await snapshot.ref.update({
      status: "pending_review",
      moderationError: true
    });
  }
};

/**
 * Trigger: New Post Creation
 * Path: topics/{topicId}/algorithms/{algorithmId}/posts/{postId}
 */
export const checkPostSafety = onDocumentCreated(
  "topics/{topicId}/algorithms/{algorithmId}/posts/{postId}",
  async (event) => {
    if (!event.data) return;
    await applyModerationActions(event.data, `Post ${event.params.postId}`);
  }
);

/**
 * Trigger: New Comment Creation
 * Path: topics/{topicId}/algorithms/{algorithmId}/posts/{postId}/comments/{commentId}
 */
export const checkCommentSafety = onDocumentCreated(
  "topics/{topicId}/algorithms/{algorithmId}/posts/{postId}/comments/{commentId}",
  async (event) => {
    if (!event.data) return;
    await applyModerationActions(event.data, `Comment ${event.params.commentId}`);
  }
);
