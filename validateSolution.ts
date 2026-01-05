
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
 * Uses Gemini 3 Pro to strictly validate the solution code against the standard algorithm.
 * Designed to run on post creation (in parallel with Relevance analysis).
 */
export const validateSolutionCode = onDocumentCreated(
  "topics/{topicId}/algorithms/{algorithmId}/posts/{postId}", 
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error("No data associated with the event");
      return;
    }

    const post = snapshot.data();
    const { code, algorithmContext } = post;
    const { postId } = event.params;

    // Skip if essential data is missing
    if (!code || !algorithmContext) {
      console.log(`Skipping validation for ${postId}: Missing code or algorithm context.`);
      return;
    }

    try {
      // Use Gemini 3 Pro for complex reasoning and code verification
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `You are a Code Compiler and Tester. Analyze this code against the standard solution for ${algorithmContext}.
        
        Code:
        ${code}

        Output one status: VERIFIED (Logic is perfect), PARTIAL (Logic is sound but misses edge cases), or INCORRECT (Fundamental logic error). Return a short 1-sentence reason.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { 
                type: Type.STRING, 
                enum: ["VERIFIED", "PARTIAL", "INCORRECT"] 
              },
              reason: { 
                type: Type.STRING 
              }
            },
            required: ["status", "reason"]
          },
        },
      });

      if (!response.text) {
        throw new Error("Received empty response from Gemini API.");
      }

      const result = JSON.parse(response.text);

      // Update the Firestore document with validation results
      await snapshot.ref.update({
        validationStatus: result.status,
        validationReason: result.reason,
        validatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Validated post ${postId}: ${result.status}`);

    } catch (error) {
      console.error("Error validating solution with Gemini:", error);
      await snapshot.ref.update({
        validationStatus: "ERROR",
        validationReason: "AI validation service temporarily unavailable."
      });
    }
  }
);
