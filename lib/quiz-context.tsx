import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizState, Question, QuizSession, CategoryStats } from './types';

interface QuizContextType {
  state: QuizState;
  initializeQuiz: (questions: Question[]) => void;
  selectAnswer: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  sessions: QuizSession[];
  loadSessions: () => Promise<void>;
  getCategoryStats: (sessions: QuizSession[]) => CategoryStats[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizAction =
  | { type: 'INITIALIZE'; payload: Question[] }
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
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...initialState,
        questions: action.payload,
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

  const initializeQuiz = useCallback((questions: Question[]) => {
    dispatch({ type: 'INITIALIZE', payload: questions });
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
