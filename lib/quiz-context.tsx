import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizState, Question, QuizSession, CategoryStats } from './types';

interface QuizContextType {
  state: QuizState;
  initializeQuiz: (questions: Question[], mode?: 'normal' | 'weak-point') => void;
  selectAnswer: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  sessions: QuizSession[];
  loadSessions: () => Promise<void>;
  getCategoryStats: (sessions: QuizSession[]) => CategoryStats[];
  getIncorrectQuestions: () => Question[];
  initializeWeakPointQuiz: (sessions: QuizSession[], allQuestions: Question[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  initializeCategoryQuiz: (category: string, allQuestions: Question[]) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizAction =
  | { type: 'INITIALIZE'; payload: Question[]; mode?: 'normal' | 'weak-point' }
  | { type: 'SELECT_ANSWER'; payload: number }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  selectedAnswerIndex: null,
  hasAnswered: false,
  questions: [],
  answers: [],
  isQuizComplete: false,
  score: 0,
  mode: 'normal',
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...initialState,
        questions: action.payload,
        mode: action.mode || 'normal',
      };
    case 'SELECT_ANSWER':
      return {
        ...state,
        selectedAnswerIndex: action.payload,
      };
    case 'SUBMIT_ANSWER': {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = state.selectedAnswerIndex === currentQuestion.correctAnswerIndex;
      const newAnswers = [
        ...state.answers,
        {
          questionId: currentQuestion.id,
          selectedIndex: state.selectedAnswerIndex!,
          isCorrect,
        },
      ];
      return {
        ...state,
        hasAnswered: true,
        answers: newAnswers,
        score: isCorrect ? state.score + 1 : state.score,
      };
    }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswerIndex: null,
        hasAnswered: false,
      };
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isQuizComplete: true,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [sessions, setSessions] = React.useState<QuizSession[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const initializeQuiz = useCallback((questions: Question[], mode: 'normal' | 'weak-point' = 'normal') => {
    dispatch({ type: 'INITIALIZE', payload: questions, mode });
  }, []);

  const selectAnswer = useCallback((index: number) => {
    if (!state.hasAnswered) {
      dispatch({ type: 'SELECT_ANSWER', payload: index });
    }
  }, [state.hasAnswered]);

  const submitAnswer = useCallback(() => {
    if (state.selectedAnswerIndex !== null && !state.hasAnswered) {
      dispatch({ type: 'SUBMIT_ANSWER' });
    }
  }, [state.selectedAnswerIndex, state.hasAnswered]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
      dispatch({ type: 'COMPLETE_QUIZ' });
    }
  }, [state.currentQuestionIndex, state.questions.length]);

  const completeQuiz = useCallback(() => {
    dispatch({ type: 'COMPLETE_QUIZ' });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('quizSessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  const saveSession = useCallback(async (session: QuizSession) => {
    try {
      const updated = [...sessions, session];
      await AsyncStorage.setItem('quizSessions', JSON.stringify(updated));
      setSessions(updated);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [sessions]);

  const getCategoryStats = useCallback((quizSessions: QuizSession[]): CategoryStats[] => {
    const categoryMap = new Map<string, { total: number; correct: number }>();

    quizSessions.forEach((session) => {
      session.answers.forEach((answer) => {
        const question = state.questions.find((q) => q.id === answer.questionId);
        if (question) {
          const category = question.category;
          const current = categoryMap.get(category) || { total: 0, correct: 0 };
          categoryMap.set(category, {
            total: current.total + 1,
            correct: current.correct + (answer.isCorrect ? 1 : 0),
          });
        }
      });
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }));
  }, [state.questions]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const getIncorrectQuestions = useCallback((): Question[] => {
    const incorrectQuestionIds = state.answers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId);
    return state.questions.filter((q) => incorrectQuestionIds.includes(q.id));
  }, [state.answers, state.questions]);

  const initializeWeakPointQuiz = useCallback(
    (quizSessions: QuizSession[], allQuestions: Question[]) => {
      const incorrectQuestionIds = new Set<string>();
      quizSessions.forEach((session) => {
        session.answers.forEach((answer) => {
          if (!answer.isCorrect) {
            incorrectQuestionIds.add(answer.questionId);
          }
        });
      });

      const weakPointQuestions = Array.from(incorrectQuestionIds)
        .map((id) => allQuestions.find((q) => q.id === id))
        .filter((q): q is Question => q !== undefined)
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      if (weakPointQuestions.length > 0) {
        dispatch({ type: 'INITIALIZE', payload: weakPointQuestions, mode: 'weak-point' });
      }
    },
    []
  );

  const initializeCategoryQuiz = useCallback(
    (category: string, allQuestions: Question[]) => {
      const categoryQuestions = allQuestions
        .filter((q) => q.category === category)
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      if (categoryQuestions.length > 0) {
        dispatch({ type: 'INITIALIZE', payload: categoryQuestions, mode: 'normal' });
        setSelectedCategory(category);
      }
    },
    []
  );

  const value: QuizContextType = {
    state,
    initializeQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    completeQuiz,
    resetQuiz,
    sessions,
    loadSessions,
    getCategoryStats,
    getIncorrectQuestions,
    initializeWeakPointQuiz,
    selectedCategory,
    setSelectedCategory,
    initializeCategoryQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
}
