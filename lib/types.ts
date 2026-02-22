/**
 * Quiz Types
 */

export interface Question {
  id: string;
  certification: string; // e.g., 'Administrator', 'Platform Developer'
  category: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Certification {
  id: string;
  name: string; // e.g., 'Salesforce 認定アドミニストレーター'
  slug: string; // e.g., 'administrator'
  description: string;
  icon?: string;
  questionCount: number;
}

export interface QuizSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswerIndex: number | null;
  hasAnswered: boolean;
  questions: Question[];
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
  isQuizComplete: boolean;
  score: number;
  mode: 'normal' | 'weak-point' | 'category';
}

// Server sync types
export interface ServerQuizResult {
  id: number;
  userId: number;
  mode: 'normal' | 'weakPoints';
  selectedCategories: string[] | null;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  categoryResults: Record<string, { correct: number; total: number }>;
  wrongQuestionIds: number[];
  timeSpent: number | null;
  completedAt: Date;
  createdAt: Date;
}

export interface WeakPointSession {
  id: string;
  createdAt: number;
  incorrectQuestionIds: string[];
  sessionId: string;
}
