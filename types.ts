
export type View = "Dashboard" | "Topics" | "TopicOverview" | "AlgorithmPage" | "Community" | "LeetCode Sync" | "Profile" | "PracticeSession" | "MockInterview" | "MockInterviewSession" | "AdminDashboard" | "SystemArchitecture";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  eduLevel: string | null;
  targetRole: string;
  preferredLanguage: string;
  reputation: number;
  expertise: "Beginner" | "Intermediate" | "Expert";
  topicStats?: Record<string, number>; // Maps Clarix Topic ID -> Solved Count
  badges: string[]; // Array of Badge IDs
  roles?: string[]; // e.g. "Topic Expert", "admin"
}

export interface Notification {
  id: string;
  type: "weakness_alert" | "info" | "success";
  message: string;
  read: boolean;
  createdAt: string; // ISO String
  targetTopic?: string; // For linking to specific content
  actionLabel?: string; // CTA text e.g., "Fix Now"
}

export interface ReflectionEntry {
  date: string; // ISO string for frontend, would be Timestamp in Firestore
  aiQuestion: string;
  userAnswer: string;
}

export interface SolvedProblemHistory {
  id: string;
  problemTitle: string;
  topicName: string;
  difficulty: string;
  reflections: ReflectionEntry[];
  completedAt: string;
}

export interface PracticeQuestion {
  id: number;
  type: "MCQ" | "Debugging" | "Algorithmic";
  questionText: string;
  codeSnippet?: string; // For Debugging or Context
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ (index or value) or Model Answer for open-ended
  explanation: string; // To show after submission
}

export interface PracticeSet {
  topic: string;
  questions: PracticeQuestion[];
}

export interface GradingResult {
  score: number; // 0-100
  feedback: string;
  questionAnalysis: {
    id: number;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface CodeReviewResult {
  complexity: string;
  complexityScore: number; // 0-100 (100 = Optimal)
  styleScore: number; // 1-10
  suggestions: string[];
  criticalIssues: string[];
  fixedCode: string;
}

export interface AlgorithmExplanation {
  title: string;
  description: string;
  intuition: string;
  pseudocode: string;
  code: {
    python: string;
    cpp: string;
    java: string;
  };
  complexity: {
    time: string;
    space: string;
    timeDetail: string;
    spaceDetail: string;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  statusText?: string;
  rating?: 'Helpful' | 'Not Helpful'; // A/B Test Rating
}

export interface Topic {
  id: string;
  title: string;
  status: "Weak" | "Mastered" | "In Progress";
  progress: number;
  total: number;
  icon: string;
}

export interface SubAlgorithm {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeComplexity: string;
  spaceComplexity: string;
  status: "Locked" | "Completed" | "Available";
}

export interface TopicOverviewData {
  topicId: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  commonMistakes: string[];
  algorithms: SubAlgorithm[];
}

export interface RecommendedProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason: string;
  topic: string;
}

export interface InterviewProblem {
  title: string;
  description: string;
  difficulty: "Medium" | "Hard";
  examples: { input: string; output: string }[];
  constraints: string[];
}

export interface CommunityPost {
  id: string;
  topicId: string;
  author: {
    name: string;
    avatar: string;
    expertise: "Beginner" | "Intermediate" | "Expert";
    roles?: string[];
    badges?: string[];
  };
  title: string;
  code: string;
  language: string;
  aiRelevance: number; // 0-100
  weightedScore: number;
  aiWarning?: string; // If present, show alert
  hasMisconception?: boolean;
  misconceptionReason?: string;
  timestamp: string;
  // New fields for strict code validation
  validationStatus?: "VERIFIED" | "PARTIAL" | "INCORRECT" | "ERROR";
  validationReason?: string;
  // Shadowban Logic
  shadowBanned?: boolean;
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  ranking: number;
  topicSkills: {
    category: string;
    topics: {
      name: string;
      solved: number;
      level: 0 | 1 | 2 | 3 | 4; // 0=none, 4=expert
    }[];
  }[];
}

export interface LearningModule {
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason: string;
  status: "Locked" | "Active" | "Completed";
}

export interface UserStats {
  topicsLearned: number;
  totalSolved: number;
  totalAttempted: number;
  accuracyRate: number;
  weakAreas: string[];
  streakDays: number;
  reputationHistory: { date: string; score: number }[];
  skillRadar: { subject: string; A: number; fullMark: number }[];
}

export interface DailyTask {
  date: string; // ISO String
  status: "pending" | "completed";
  concept: string;
  problem: {
    title: string;
    difficulty: "Easy" | "Medium";
    description: string;
  };
}

// ADMIN DASHBOARD TYPES
export interface DailyStat {
  date: string; // "Jan 01"
  activeUsers: number;
}

export interface TopicMisconceptionStat {
  topic: string;
  misleadingCount: number;
}

export interface AIAccuracyStat {
  name: string;
  value: number;
  color: string;
}

export interface FlaggedUser {
  id: string;
  displayName: string;
  email: string;
  flagType: "Spam" | "Toxicity" | "Plagiarism";
  severityScore: number; // 0.0 - 1.0
  status: "Active" | "ShadowBanned" | "Banned";
}

// Experiment Types
export interface ExperimentVariantStats {
  id: string;
  name: string;
  description: string;
  avgSessionTime: string; // e.g. "12m 30s"
  avgSessionSeconds: number; // for comparison
  positiveFeedbackPercent: number; // 0-100
  nextProblemSuccessRate: number; // 0-100
  totalParticipants: number;
}

export interface ExperimentData {
  id: string;
  name: string;
  status: "Active" | "Concluded";
  variants: ExperimentVariantStats[];
}
