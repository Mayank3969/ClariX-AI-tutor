
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Firebase Admin if not already active
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to generate a personalized learning path based on user profile.
 * Trigger: HTTPS Callable
 * 
 * Input Data: 
 * - uid: string
 * - weakAreas: string[] (derived from LeetCode stats)
 * - targetRole: string (e.g., "Frontend Engineer", "SDE II")
 * 
 * Output:
 * - Saves a JSON array of learning modules to users/{uid}/learningPath/main
 * - Returns the generated modules
 */
export const generateLearningPath = onCall(async (request) => {
  const { uid, weakAreas, targetRole } = request.data;

  if (!uid) {
    throw new HttpsError("invalid-argument", "The function must be called with a 'uid'.");
  }

  // Fallback defaults if data is missing
  const role = targetRole || "Software Engineer";
  const areas = weakAreas && weakAreas.length > 0 ? weakAreas : ["Data Structures", "Algorithms"];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Prompt Engineering for strict JSON output tailored to the user's gaps
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Career Coach and Technical Mentor.
      Create a structured learning path for a candidate targeting the role of: '${role}'.
      
      The candidate is weak in the following areas: ${areas.join(", ")}.
      
      Generate a list of 3-5 high-impact learning modules to address these specific weaknesses.
      For each module, provide:
      1. topic: The specific algorithm or concept name.
      2. difficulty: 'Easy', 'Medium', or 'Hard' (gradual progression).
      3. reason: A direct, personalized sentence explaining why this module is critical for their ${role} goals and how it addresses their weakness in ${areas[0]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              reason: { type: Type.STRING },
            },
            required: ["topic", "difficulty", "reason"],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("Received empty response from Gemini API.");
    }

    const learningModules = JSON.parse(response.text);

    // Persist the personalized path to Firestore
    const db = admin.firestore();
    const pathRef = db.collection("users").doc(uid).collection("learningPath").doc("main");
    
    await pathRef.set({
      modules: learningModules,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      context: {
        targetRole: role,
        weakAreas: areas
      }
    });

    console.log(`Generated learning path for user ${uid} with ${learningModules.length} modules.`);
    return { success: true, modules: learningModules };

  } catch (error) {
    console.error("Error generating learning path:", error);
    throw new HttpsError("internal", "Failed to generate learning path.", error);
  }
});
