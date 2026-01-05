
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Firebase Admin if not already active
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Triggered when a new document is created in the nested posts collection.
 * Path: topics/{topicId}/algorithms/{algorithmId}/posts/{postId}
 * 
 * Uses Gemini API to analyze the content for relevance, accuracy, and edge-case failures.
 */
export const analyzePostRelevance = onDocumentCreated(
  "topics/{topicId}/algorithms/{algorithmId}/posts/{postId}", 
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error("No data associated with the event");
      return;
    }

    const post = snapshot.data();
    const { postContent, algorithmContext, code } = post;
    const { topicId, algorithmId, postId } = event.params;

    // Combine text content and code for a full context analysis
    const fullContent = `
      User Explanation: ${postContent || "No explanation provided"}
      User Code: ${code || "No code provided"}
    `;

    if (!fullContent.trim() || !algorithmContext) {
      console.log(`Skipping analysis for ${postId}: Missing content or algorithm context.`);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are a Senior Technical Interviewer and Algorithm Expert at a top-tier tech company. 
          Analyze the following student submission for the topic: "${algorithmContext}" (Topic ID: ${topicId}).
          
          Evaluate the submission based on:
          1. Semantic Relevance: Is the discussion actually about the specific algorithm?
          2. Topic Match: Does the code/logic align with the expected approach for this topic?
          3. Logical Edge-Case Failures: Analyze the code for logical edge-case failures (e.g., negative numbers in array indexing, integer overflow, empty inputs). If a failure is found, set hasMisconception to true and populate a misconceptionReason string (e.g., "This solution fails for negative integers").
          4. General Misleading Info: Does the solution contain other incorrect logic or bad practices?

          Submission Content:
          ${fullContent}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              semanticRelevance: {
                type: Type.INTEGER,
                description: "A score from 0 to 100 indicating how relevant the post is to the topic.",
              },
              topicMatchScore: {
                type: Type.INTEGER,
                description: "A score from 0 to 10 indicating how well the code solves the problem.",
              },
              confidenceRating: {
                type: Type.NUMBER,
                description: "A float from 0.0 to 1.0 indicating AI confidence.",
              },
              isMisleading: {
                type: Type.BOOLEAN,
                description: "True if the solution contains significant errors or misconceptions.",
              },
              hasMisconception: {
                type: Type.BOOLEAN,
                description: "True if the code fails specific edge cases or logical constraints.",
              },
              misconceptionReason: {
                type: Type.STRING,
                description: "Specific reason for the edge-case failure (e.g., 'Fails on empty input').",
                nullable: true,
              },
              aiWarning: {
                type: Type.STRING,
                description: "A brief, one-sentence general warning if the post is misleading. Null otherwise.",
                nullable: true,
              }
            },
            required: ["semanticRelevance", "topicMatchScore", "confidenceRating", "isMisleading", "hasMisconception"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Received empty response from Gemini API.");
      }

      const analysis = JSON.parse(response.text);

      // Calculate a weighted quality score for sorting feeds (Logic Layer)
      // 70% weight on relevance, 30% weight on technical accuracy
      const calculatedWeightedScore = Math.round(
        (analysis.semanticRelevance * 0.7) + (analysis.topicMatchScore * 10 * 0.3)
      );

      // Determine the final warning message to display
      // Prioritize the specific misconception reason if available
      const finalWarning = analysis.hasMisconception 
          ? analysis.misconceptionReason 
          : (analysis.isMisleading ? (analysis.aiWarning || "Contains potential misconceptions.") : null);

      // Update the Firestore document with the AI analysis
      await snapshot.ref.update({
        aiAnalysis: {
          semanticRelevance: analysis.semanticRelevance,
          topicMatchScore: analysis.topicMatchScore,
          confidenceRating: analysis.confidenceRating,
          isMisleading: analysis.isMisleading,
          hasMisconception: analysis.hasMisconception,
          misconceptionReason: analysis.misconceptionReason
        },
        // Flatten key fields for easier indexing/querying on the client
        aiRelevance: analysis.semanticRelevance,
        aiWarning: finalWarning,
        hasMisconception: analysis.hasMisconception,
        misconceptionReason: analysis.misconceptionReason,
        weightedScore: calculatedWeightedScore,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Analyzed post ${postId} in topic ${topicId}. Score: ${calculatedWeightedScore}. Misconception: ${analysis.hasMisconception}`);

    } catch (error) {
      console.error("Error analyzing post with Gemini:", error);
      // Optionally update the doc to show analysis failed so we don't retry indefinitely
      await snapshot.ref.update({
        aiAnalysisStatus: "FAILED"
      });
    }
  }
);
