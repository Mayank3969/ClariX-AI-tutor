
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: performCodeReview
 * Triggered when a user submits a solution in the Mock Interview session.
 */
export const performCodeReview = onCall(async (request) => {
  const { code, problemContext, language } = request.data;

  if (!code || !problemContext) {
    throw new HttpsError("invalid-argument", "Missing code or problem context.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a Senior Software Engineer conducting a code review.
        
        Problem Context:
        Title: ${problemContext.title}
        Description: ${problemContext.description}
        Constraints: ${problemContext.constraints.join(", ")}

        User Code (${language || "Python"}):
        ${code}

        Task: Analyze the code on 3 dimensions:
        1. Big O Analysis: Calculate actual Time & Space complexity. Compare to the optimal solution.
        2. Code Style: Check variable naming (camelCase/snake_case), indentation, modularity.
        3. Logical Flaws: Identify overflows, null pointers, infinite loops, or edge case failures.

        Output strictly in JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complexity: { 
              type: Type.STRING,
              description: "E.g., 'Time: O(n), Space: O(1). Optimal matches.' or 'Time: O(n^2), Optimal is O(n).'"
            },
            styleScore: { 
              type: Type.INTEGER,
              description: "A score from 1 to 10 based on clean code principles."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 specific improvements (style or logic)."
            }
          },
          required: ["complexity", "styleScore", "suggestions"]
        },
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI.");
    }

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Code Review Error:", error);
    throw new HttpsError("internal", "Failed to perform code review.");
  }
});
