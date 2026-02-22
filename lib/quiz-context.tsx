import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizState, Question, QuizSession, CategoryStats, ServerQuizResult } from './types';

interface QuizContextType {
  state: QuizState;
  initializeQuiz: (questions: Question[], mode?: 'normal' | 'weak-point') => void;
  selectAnswer: (index: number) => void;
  toggleMultipleAnswer: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  completeQuiz: () => Promise<void>;
  resetQuiz: () => void;
  sessions: QuizSession[];
  loadSessions: () => Promise<void>;
  getCategoryStats: (sessions: QuizSession[]) => CategoryStats[];
  getIncorrectQuestions: () => Question[];
  initializeWeakPointQuiz: (sessions: QuizSession[], allQuestions: Question[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  initializeCategoryQuiz: (category: string, allQuestions: Question[]) => void;
  selectedCertification: string | null;
  setSelectedCertification: (certification: string | null) => void;
  serverResults: ServerQuizResult[];
  loadServerResults: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizAction =
  | { type: 'INITIALIZE'; payload: Question[]; mode?: 'normal' | 'weak-point' | 'category' }
  | { type: 'SELECT_ANSWER'; payload: number }
  | { type: 'TOGGLE_MULTIPLE_ANSWER'; payload: number }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  selectedAnswerIndex: null,
  selectedAnswerIndices: [],
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
        selectedAnswerIndices: [],
      };
    case 'TOGGLE_MULTIPLE_ANSWER': {
      const newIndices = state.selectedAnswerIndices.includes(action.payload)
        ? state.selectedAnswerIndices.filter((i) => i !== action.payload)
        : [...state.selectedAnswerIndices, action.payload];
      return {
        ...state,
        selectedAnswerIndices: newIndices,
      };
    }
    case 'SUBMIT_ANSWER': {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      let isCorrect = false;
      let selectedIndex: number | number[];

      if (currentQuestion.isMultipleChoice) {
        const correctIndices = Array.isArray(currentQuestion.correctAnswerIndex)
          ? currentQuestion.correctAnswerIndex.sort((a, b) => a - b)
          : [currentQuestion.correctAnswerIndex];
        const selectedIndices = state.selectedAnswerIndices.sort((a, b) => a - b);
        isCorrect =
          selectedIndices.length === correctIndices.length &&
          selectedIndices.every((idx, i) => idx === correctIndices[i]);
        selectedIndex = selectedIndices;
      } else {
        isCorrect = state.selectedAnswerIndex === currentQuestion.correctAnswerIndex;
        selectedIndex = state.selectedAnswerIndex!;
      }

      const newAnswers = [
        ...state.answers,
        {
          questionId: currentQuestion.id,
          selectedIndex,
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
        selectedAnswerIndices: [],
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
  const [selectedCertification, setSelectedCertification] = React.useState<string | null>('Administrator');
  const [serverResults, setServerResults] = React.useState<ServerQuizResult[]>([]);

  const initializeQuiz = useCallback((questions: Question[], mode: 'normal' | 'weak-point' = 'normal') => {
    dispatch({ type: 'INITIALIZE', payload: questions, mode });
  }, []);

  const selectAnswer = useCallback((index: number) => {
    dispatch({ type: 'SELECT_ANSWER', payload: index });
  }, []);

  const toggleMultipleAnswer = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_MULTIPLE_ANSWER', payload: index });
  }, []);

  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const completeQuiz = useCallback(async () => {
    dispatch({ type: 'COMPLETE_QUIZ' });
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('quizSessions');
      const sessionsList = stored ? JSON.parse(stored) : [];
      setSessions(sessionsList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  const getCategoryStats = useCallback((sessions: QuizSession[]): CategoryStats[] => {
    const categoryMap = new Map<string, { correct: number; total: number }>();

    sessions.forEach((session) => {
      session.answers.forEach((answer) => {
        const question = state.questions.find((q) => q.id === answer.questionId);
        if (question) {
          const existing = categoryMap.get(question.category) || { correct: 0, total: 0 };
          categoryMap.set(question.category, {
            correct: existing.correct + (answer.isCorrect ? 1 : 0),
            total: existing.total + 1,
          });
        }
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [state.questions]);

  const getIncorrectQuestions = useCallback((): Question[] => {
    const incorrectIds = new Set(
      state.answers.filter((a) => !a.isCorrect).map((a) => a.questionId)
    );
    return state.questions.filter((q) => incorrectIds.has(q.id));
  }, [state.answers, state.questions]);

  const initializeWeakPointQuiz = useCallback(
    (sessions: QuizSession[], allQuestions: Question[]) => {
      const incorrectIds = new Set<string>();
      sessions.forEach((session) => {
        session.answers.forEach((answer) => {
          if (!answer.isCorrect) {
            incorrectIds.add(answer.questionId);
          }
        });
      });

      const weakPointQuestions = allQuestions.filter((q) => incorrectIds.has(q.id));
      const selectedQuestions = weakPointQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      dispatch({ type: 'INITIALIZE', payload: selectedQuestions, mode: 'weak-point' });
    },
    []
  );

  const initializeCategoryQuiz = useCallback((category: string, allQuestions: Question[]) => {
    const categoryQuestions = allQuestions.filter((q) => q.category === category);
    const selectedQuestions = categoryQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    dispatch({ type: 'INITIALIZE', payload: selectedQuestions, mode: 'category' });
  }, []);

  const loadServerResults = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('serverResults');
      const results = stored ? JSON.parse(stored) : [];
      setServerResults(results);
    } catch (error) {
      console.error('Failed to load server results:', error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    loadServerResults();
  }, [loadServerResults]);

  const value: QuizContextType = {
    state,
    initializeQuiz,
    selectAnswer,
    toggleMultipleAnswer,
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
    selectedCertification,
    setSelectedCertification,
    serverResults,
    loadServerResults,
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
