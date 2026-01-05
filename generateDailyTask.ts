
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * DailyTaskService
 * Runs every day at 00:00 UTC.
 * Generates a personalized daily task for each user consisting of a concept and a micro-problem.
 */
export const generateDailyTask = onSchedule("every day 00:00", async (event) => {
  const db = admin.firestore();
  
  try {
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // 1. Fetch User Stats to identify weak areas
      const statsDoc = await db.doc(`users/${userId}/userStats/main`).get();
      const stats = statsDoc.exists ? statsDoc.data() : null;
      
      // Default to "General Algorithms" if no stats or weak areas found
      const weakAreas = stats?.weakAreas && stats.weakAreas.length > 0 
        ? stats.weakAreas 
        : ["Arrays", "Strings"];
      
      // Pick a random weak topic to focus on
      const weakTopic = weakAreas[Math.floor(Math.random() * weakAreas.length)];

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // 2. Generate Content with Gemini
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `
            Target Audience: A software engineer preparing for interviews.
            Focus Topic: ${weakTopic}.
            
            Task:
            1. Concept: Generate a fascinating, 3-sentence fact or 'did you know' about ${weakTopic} (e.g., cache locality in arrays vs linked lists).
            2. Problem: Create a short 'Micro-Problem' title and description suitable for a quick mental exercise or whiteboard session. Difficulty must be Easy or Medium.
            
            Output strictly valid JSON.
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                concept: { 
                  type: Type.STRING,
                  description: "A 3-sentence conceptual fact."
                },
                problem: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ["Easy", "Medium"] },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "difficulty", "description"]
                }
              },
              required: ["concept", "problem"]
            }
          }
        });

        if (response.text) {
          const taskData = JSON.parse(response.text);

          // 3. Store in Firestore
          // Overwrites the 'current' daily task document
          await db.doc(`users/${userId}/dailyTask/current`).set({
            ...taskData,
            date: new Date().toISOString(),
            status: "pending",
            topic: weakTopic
          });
          
          console.log(`Generated daily task for user ${userId} on topic ${weakTopic}`);
        }

      } catch (innerError) {
        console.error(`Failed to generate task for user ${userId}:`, innerError);
      }
    }
  } catch (error) {
    console.error("Fatal error in DailyTaskService:", error);
  }
});
