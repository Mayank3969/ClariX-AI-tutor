
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore";
import { initializeApp, getApp, getApps } from "firebase/app";

// Robust mapping from LeetCode tags to Clarix AI canonical Topic IDs
const TAG_MAPPING: Record<string, string> = {
  // Linear Data Structures
  "Array": "arrays-hashing",
  "Hash Table": "arrays-hashing",
  "String": "arrays-hashing",
  "Linked List": "linked-lists",
  "Doubly-Linked List": "linked-lists",
  "Stack": "stacks-queues",
  "Queue": "stacks-queues",
  "Monotonic Stack": "stacks-queues",
  "Heap (Priority Queue)": "heaps",
  
  // Non-Linear
  "Tree": "trees",
  "Binary Tree": "trees",
  "Binary Search Tree": "trees",
  "Trie": "trees",
  "Graph": "graphs",
  "Breadth-First Search": "graphs",
  "Depth-First Search": "graphs",
  "Union Find": "graphs",
  "Topological Sort": "graphs",
  "Shortest Path": "graphs",

  // Algorithmic Paradigms
  "Two Pointers": "two-pointers",
  "Sliding Window": "two-pointers",
  "Dynamic Programming": "dynamic-programming",
  "Memoization": "dynamic-programming",
  "Backtracking": "recursion-backtracking",
  "Recursion": "recursion-backtracking",
  "Sorting": "sorting-searching",
  "Binary Search": "sorting-searching",
  "Greedy": "greedy",
  "Bit Manipulation": "bit-manipulation",
  "Math": "math-geometry",
  "Geometry": "math-geometry"
};

interface TagCount {
  tagName: string;
  problemsSolved: number;
}

interface GraphQLPayload {
  data: {
    matchedUser: {
      tagProblemCounts: {
        advanced: TagCount[];
        intermediate: TagCount[];
        fundamental: TagCount[];
      }
    }
  }
}

export class LeetCodeSyncService {
  private db;

  constructor() {
    // Ensure Firebase is initialized (Assumes app init happened elsewhere, or lazy init here)
    // Note: In a real app, you'd pass the initialized app or db instance.
    // For this file, we attempt to get the default app.
    const app = getApps().length > 0 ? getApp() : initializeApp({ /* config placeholder */ }); 
    this.db = getFirestore(app);
  }

  /**
   * Main entry point to sync data.
   * Parses the raw JSON and updates the user's Firestore document.
   */
  async syncUserStats(userId: string, rawJson: string | object): Promise<{ success: boolean; stats: Record<string, number> }> {
    try {
      const payload = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      const clarixStats = this.processPayload(payload);
      
      if (Object.keys(clarixStats).length === 0) {
        console.warn("No valid stats extracted from payload.");
        return { success: false, stats: {} };
      }

      await this.updateFirestore(userId, clarixStats);
      return { success: true, stats: clarixStats };

    } catch (error) {
      console.error("LeetCode Sync Failed:", error);
      throw error;
    }
  }

  /**
   * Updates the user document with the new stats.
   */
  private async updateFirestore(userId: string, stats: Record<string, number>) {
    const userRef = doc(this.db, "users", userId);
    
    // We update the 'topicStats' map field. 
    // Using { merge: true } via setDoc is safer if the doc might be missing,
    // but updateDoc is standard for existing users.
    await setDoc(userRef, { topicStats: stats }, { merge: true });
    console.log(`Updated Firestore for user ${userId} with ${Object.keys(stats).length} topics.`);
  }

  /**
   * Determines the format of the payload and extracts counts.
   */
  private processPayload(payload: any): Record<string, number> {
    const counts: Record<string, number> = {};

    // 1. Check for GraphQL 'tagProblemCounts' structure (Most accurate)
    if (payload?.data?.matchedUser?.tagProblemCounts) {
      const { advanced, intermediate, fundamental } = payload.data.matchedUser.tagProblemCounts;
      const allTags = [...(advanced || []), ...(intermediate || []), ...(fundamental || [])];
      
      allTags.forEach((tag: TagCount) => {
        this.aggregateTag(counts, tag.tagName, tag.problemsSolved);
      });
      return counts;
    }

    // 2. Check for simple array of submissions (e.g., from browser extension export)
    // Expected format: [{ title: "Two Sum", tags: ["Array"], status: "Accepted" }, ...]
    if (Array.isArray(payload)) {
      payload.forEach((submission: any) => {
        // Only count accepted solutions
        if (submission.status === "Accepted" || submission.statusDisplay === "Accepted") {
          const tags = Array.isArray(submission.tags) ? submission.tags : [];
          tags.forEach((tag: string) => {
            // Logic: 1 solved problem adds 1 to the count. 
            // Note: This naive approach might double count if processing full history.
            // Ideally, the payload should be aggregate stats, not raw history, for this method.
            // But if it IS raw history, we assume 1 count per entry.
             this.aggregateTag(counts, tag, 1);
          });
        }
      });
      return counts;
    }

    // 3. Check for flat stats object (e.g. custom JSON: { "Array": 50, "DP": 10 })
    if (typeof payload === 'object') {
       Object.entries(payload).forEach(([key, value]) => {
          if (typeof value === 'number') {
             this.aggregateTag(counts, key, value);
          }
       });
       return counts;
    }

    return counts;
  }

  /**
   * Helper to map a raw tag to a Clarix ID and increment the counter.
   */
  private aggregateTag(counts: Record<string, number>, rawTag: string, value: number) {
    const clarixId = TAG_MAPPING[rawTag];
    
    if (clarixId) {
      if (!counts[clarixId]) {
        counts[clarixId] = 0;
      }
      counts[clarixId] += value;
    }
  }
}
