/**
 * Quiz Types
 */

export interface Question {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
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
}
