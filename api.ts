
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { RecommendedProblem, LeetCodeStats, AlgorithmExplanation, SolvedProblemHistory, ReflectionEntry, PracticeSet, GradingResult, InterviewProblem, CodeReviewResult, DailyTask } from "./types";

export const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- A/B TESTING CONFIGURATION ---
export const AB_TEST_CONFIG = {
  experimentId: "tutor_methodology_v1",
  variants: {
    A: {
      id: "A",
      name: "Socratic Method",
      prompt: "You are an expert Data Structures and Algorithms tutor. Use the **Socratic Method**: ask guiding questions to help the user derive the answer themselves. Do NOT give the full code or solution immediately. Encourage critical thinking."
    },
    B: {
      id: "B",
      name: "Direct Instruction",
      prompt: "You are an expert Data Structures and Algorithms tutor. Use **Direct Instruction**: provide clear, step-by-step explanations followed immediately by code examples. Be authoritative, concise, and prioritize information density over questioning."
    }
  }
};

export const getAITutorVariant = (userId: string) => {
  // Deterministic assignment based on User ID hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Modulo to split into Group A and Group B
  const isGroupA = Math.abs(hash) % 2 === 0;
  return isGroupA ? AB_TEST_CONFIG.variants.A : AB_TEST_CONFIG.variants.B;
};

export const logExplanationRating = async (userId: string, rating: 'Helpful'|'Not Helpful', variantId: string) => {
    // In a real application, this would write to a Firestore collection 'experiment_results'
    console.log(`[AB_TEST] Experiment: ${AB_TEST_CONFIG.experimentId} | User: ${userId} | Variant: ${variantId} | Rating: ${rating}`);
    return true;
};

export const promoteExperimentVariant = async (experimentId: string, variantId: string): Promise<void> => {
    // In a real app, this would trigger a Cloud Function to update Remote Config or a global Firestore settings doc.
    console.log(`[AB_TEST] Promoting Variant ${variantId} for Experiment ${experimentId} to WINNER status.`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`[AB_TEST] Default system prompt successfully updated to Variant ${variantId}.`);
    return;
};

// Mock database for reflections persistence in demo
let MOCK_JOURNAL_DB: SolvedProblemHistory[] = [
  {
    id: "h1",
    problemTitle: "Two Sum",
    topicName: "Arrays & Hashing",
    difficulty: "Easy",
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reflections: [
      {
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        aiQuestion: "Could you solve this without the extra O(n) space if the array was already sorted?",
        userAnswer: "Yes, I would use the Two Pointers technique. By having a left and right pointer and moving them based on the sum, I could achieve O(1) space."
      }
    ]
  },
  {
    id: "h2",
    problemTitle: "Climbing Stairs",
    topicName: "Dynamic Programming",
    difficulty: "Easy",
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    reflections: [
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        aiQuestion: "How does this problem relate to the Fibonacci sequence, and why is that useful?",
        userAnswer: "The number of ways to reach step N is the sum of ways for N-1 and N-2. It's exactly Fibonacci! This helps me reuse my knowledge of iterative Fibonacci to solve it in O(n) time and O(1) space."
      }
    ]
  }
];

export const saveReflectionToHistory = async (topicName: string, problemTitle: string, aiQuestion: string, userAnswer: string): Promise<boolean> => {
  console.log("Persisting Reflection to Firestore:", { topicName, problemTitle, aiQuestion, userAnswer });
  
  const existingIndex = MOCK_JOURNAL_DB.findIndex(p => p.problemTitle === problemTitle);
  const newReflection: ReflectionEntry = {
    date: new Date().toISOString(),
    aiQuestion,
    userAnswer
  };

  if (existingIndex > -1) {
    MOCK_JOURNAL_DB[existingIndex].reflections.push(newReflection);
  } else {
    MOCK_JOURNAL_DB.push({
      id: "h-" + Math.random().toString(36).substr(2, 9),
      problemTitle,
      topicName,
      difficulty: "Medium", // Default for demo
      completedAt: new Date().toISOString(),
      reflections: [newReflection]
    });
  }
  
  return true;
};

export const fetchUserReflectionJournal = async (): Promise<SolvedProblemHistory[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...MOCK_JOURNAL_DB].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
};

export const fetchDailyTask = async (): Promise<DailyTask> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        date: new Date().toISOString(),
        status: "pending",
        concept: "Did you know QuickSort is faster than MergeSort for arrays because of cache locality? It sorts in-place, maximizing cache hits.",
        problem: {
            title: "Quick Pivot Logic",
            difficulty: "Easy",
            description: "Given the array [4, 1, 3, 9, 7] and using 4 as the pivot, write the array state after the first partitioning step (Lomuto or Hoare)."
        }
    };
};

export const generateReflectionQuestion = async (topicName: string, code: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User has just solved the problem: '${topicName}'. 
      Here is their code:
      \`\`\`
      ${code}
      \`\`\`
      Task: Ask the user a high-level, Socratic reflection question that encourages them to think about trade-offs, optimizations, or alternative data structures. 
      Example: 'I see you used a nested loop. Can you think of a way to do this in O(n) using a Set?'
      Be concise (max 2 sentences).`,
    });
    return response.text?.trim() || "What was the most challenging part of this problem for you?";
  } catch (error) {
    console.error("Gemini Reflection Error:", error);
    return "Reflect on how you could improve the space complexity of your solution.";
  }
};

export const getAlgorithmExplanation = async (topicName: string, expertise: string): Promise<AlgorithmExplanation> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a detailed algorithm explanation for the topic: '${topicName}'. 
      The target audience has '${expertise}' level expertise. 
      Provide intuitive explanations, pseudocode, and production-ready code in Python, C++, and Java.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            intuition: { type: Type.STRING },
            pseudocode: { type: Type.STRING },
            code: {
              type: Type.OBJECT,
              properties: {
                python: { type: Type.STRING },
                cpp: { type: Type.STRING },
                java: { type: Type.STRING },
              },
              required: ["python", "cpp", "java"],
            },
            complexity: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                space: { type: Type.STRING },
                timeDetail: { type: Type.STRING },
                spaceDetail: { type: Type.STRING },
              },
              required: ["time", "space", "timeDetail", "spaceDetail"],
            },
          },
          required: ["title", "description", "intuition", "pseudocode", "code", "complexity"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty AI response");
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return {
      title: topicName,
      description: `Detailed study guide for ${topicName}.`,
      intuition: "Standard intuition for this algorithm.",
      pseudocode: "Standard pseudocode.",
      code: {
        python: "def solution(): pass",
        cpp: "void solution() {}",
        java: "class Solution {}"
      },
      complexity: {
        time: "O(N)",
        space: "O(N)",
        timeDetail: "Linear.",
        spaceDetail: "Linear."
      }
    };
  }
};

export const generatePersonalizedContent = async (expertise: string) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, single-sentence coding tip for a Software Engineer at '${expertise}' level.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Check your documentation for the latest SDE best practices.";
  }
};

export const generatePracticeSet = async (weakTopic: string): Promise<PracticeSet> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a custom practice set of 5 questions for the topic: '${weakTopic}'.
      
      Structure:
      Q1-2: Multiple Choice (Conceptual).
      Q3: Debugging (Find the error in a provided short code snippet).
      Q4-5: Algorithmic Thinking (Scenario based, ask user to describe approach).

      Ensure the content is challenging but solvable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  type: { type: Type.STRING, enum: ["MCQ", "Debugging", "Algorithmic"] },
                  questionText: { type: Type.STRING },
                  codeSnippet: { type: Type.STRING, nullable: true },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    nullable: true 
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "type", "questionText", "correctAnswer", "explanation"],
              },
            },
          },
          required: ["topic", "questions"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty AI response");

  } catch (error) {
    console.error("Gemini Practice Set Error:", error);
    // Fallback data for demo stability
    return {
      topic: weakTopic,
      questions: [
        {
          id: 1,
          type: "MCQ",
          questionText: "What is the primary advantage of Dynamic Programming over simple recursion?",
          options: ["Faster execution time due to memoization", "Uses less memory always", "Easier to implement", "Works for all problems"],
          correctAnswer: "Faster execution time due to memoization",
          explanation: "DP stores results of subproblems to avoid re-computation."
        },
        {
          id: 3,
          type: "Debugging",
          questionText: "Find the bug in this Fibonacci implementation.",
          codeSnippet: "def fib(n):\n  if n == 0: return 0\n  return fib(n-1) + fib(n-2)",
          correctAnswer: "Missing base case for n == 1",
          explanation: "Without checking if n == 1 return 1, the recursion will go into negative numbers or infinite depth."
        }
      ]
    };
  }
};

export const gradePracticeSet = async (
  topic: string,
  questions: { id: number; text: string; correctAnswer: string }[],
  userAnswers: Record<number, string>
): Promise<GradingResult> => {
  try {
    const ai = getGeminiClient();
    
    // Construct the context for grading
    let promptContext = `Grade the following practice session for the topic: ${topic}.\n\n`;
    questions.forEach(q => {
      promptContext += `Q${q.id}: ${q.text}\n`;
      promptContext += `Correct Answer/Concept: ${q.correctAnswer}\n`;
      promptContext += `User Answer: ${userAnswers[q.id] || "No Answer"}\n\n`;
    });
    
    promptContext += `Task:
    1. Determine if each answer is correct (for open ended, is the reasoning sound?).
    2. Assign a total score from 0 to 100 based on accuracy.
    3. Provide brief feedback for each question.
    4. Provide an overall summary feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            questionAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  isCorrect: { type: Type.BOOLEAN },
                  feedback: { type: Type.STRING }
                },
                required: ["id", "isCorrect", "feedback"]
              }
            }
          },
          required: ["score", "feedback", "questionAnalysis"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to grade");

  } catch (error) {
    console.error("Grading Error:", error);
    return {
      score: 0,
      feedback: "Error grading submission. Please try again.",
      questionAnalysis: []
    };
  }
};

export const getRandomInterviewProblem = (): InterviewProblem => {
  // In a real app, this might come from a database or even Gemini call
  const problems: InterviewProblem[] = [
    {
      title: "Merge k Sorted Lists",
      description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
      difficulty: "Hard",
      examples: [
        { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
      ],
      constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"]
    },
    {
      title: "Course Schedule",
      description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.",
      difficulty: "Medium",
      examples: [
        { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
        { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" }
      ],
      constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"]
    },
    {
      title: "LRU Cache",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) operations.",
      difficulty: "Medium",
      examples: [
        { input: "LRUCache c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1);", output: "1" }
      ],
      constraints: ["1 <= capacity <= 3000", "0 <= key <= 10000", "0 <= value <= 10^5"]
    }
  ];
  return problems[Math.floor(Math.random() * problems.length)];
};

export const createMockInterviewer = (problemContext?: InterviewProblem): Chat => {
  const ai = getGeminiClient();
  
  let problemPrompt = "";
  if (problemContext) {
    problemPrompt = `
    The candidate has been assigned the following problem:
    Title: ${problemContext.title}
    Description: ${problemContext.description}
    
    When you start, acknowledge that this is the problem.
    `;
  } else {
    problemPrompt = "Start the conversation immediately by randomly selecting a LeetCode Medium or Hard problem (e.g., Graphs, DP, Trees). State the problem clearly.";
  }

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a Senior Staff Software Engineer at a top tech company (like Google or Meta) conducting a mock technical interview. 
      Your Persona: Strict, professional, fair, but demanding. You value clear communication over silent coding.

      Protocol:
      1. ${problemPrompt}
      2. Wait for the user to explain their approach.
      
      CRITICAL RULES:
      - INTERRUPT IF CODING TOO SOON: If the user's input looks like code (variable declarations, function definitions, loops) without a prior explanation of the logic, STOP THEM immediately. Say: "Hold on. In a real interview, you need to clarify your thought process first. Walk me through your approach before writing a single line of code."
      - CHALLENGE SHALLOW LOGIC: If the user gives a brute force or shallow answer (e.g., "I'll loop through it"), challenge them. Ask: "What is the time complexity of that approach? Can we optimize it?" or "How does that scale with large inputs?"
      - FORCE COMMUNICATION: Do not let them proceed to code until you are satisfied with their verbal/written algorithm description.
      - **ENABLE CODING**: When you are finally satisfied with the approach and complexity analysis, you MUST reply with exactly the phrase: "You may proceed to code". Do not use variations. This triggers the editor.

      Style:
      - Be concise. Don't write paragraphs.
      - Use bolding for emphasis.
      - Act exactly like a real interviewer on a video call text chat.`,
    },
  });
};

export const analyzeCodeSubmission = async (code: string, problem: InterviewProblem): Promise<CodeReviewResult> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a Senior Software Engineer conducting a code review.
        
        Problem Context:
        Title: ${problem.title}
        Description: ${problem.description}
        Constraints: ${problem.constraints.join(", ")}

        User Code:
        ${code}

        Task: Analyze the code on 3 dimensions:
        1. Big O Analysis: Calculate actual Time & Space complexity. Compare to the optimal solution. Assign a complexity score (0-100, where 100 is optimal).
        2. Code Style: Check variable naming (camelCase/snake_case), indentation, modularity.
        3. Logical Flaws: Identify overflows, null pointers, infinite loops, or edge case failures. Return these as 'criticalIssues'.
        4. Fix: Provide a cleaned, optimized version of the code ('fixedCode').

        Output strictly in JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complexity: { type: Type.STRING },
            complexityScore: { type: Type.INTEGER, description: "0 to 100 score for algorithmic efficiency" },
            styleScore: { type: Type.INTEGER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            criticalIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fixedCode: { type: Type.STRING, description: "The refactored and fixed code" }
          },
          required: ["complexity", "complexityScore", "styleScore", "suggestions", "criticalIssues", "fixedCode"]
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI.");
  } catch (error) {
    console.error("Code Review Error:", error);
    return {
      complexity: "Analysis failed.",
      complexityScore: 0,
      styleScore: 0,
      suggestions: ["Could not generate review. Please try again."],
      criticalIssues: [],
      fixedCode: code
    };
  }
};

export const syncLeetCodeStats = async (username: string): Promise<LeetCodeStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        username,
        totalSolved: 342,
        ranking: 145002,
        topicSkills: [
          {
            category: "Linear Structures",
            topics: [
              { name: "Arrays", solved: 120, level: 4 },
              { name: "Strings", solved: 85, level: 4 },
            ]
          }
        ]
      });
    }, 1500);
  });
};

export const getRecommendedProblem = async (weakTopics: string[]): Promise<RecommendedProblem> => {
    return {
        title: "Two Sum",
        difficulty: "Easy",
        reason: "Core fundamental for hashing.",
        topic: "Arrays"
    };
};

export const compareSolutions = async (codeA: string, codeB: string): Promise<string> => {
    return "Comparison complete. Solution B is more space efficient.";
};

export const regenerateTopicSummary = async (topicTitle: string, algorithmTitles: string[]): Promise<string> => {
    return `Summary of ${topicTitle} including ${algorithmTitles.join(', ')}.`;
};

export const generateExplanationImage = async (context: string): Promise<string | null> => null;
export const generateExplanationVideo = async (context: string, onProgress?: (status: string) => void): Promise<string | null> => null;
