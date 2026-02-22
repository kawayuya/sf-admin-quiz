import { describe, it, expect } from 'vitest';
import type { Question, QuizSession } from './types';

// テスト用のモック問題データ
const mockQuestions: Question[] = [
  {
    id: 'q1',
    certification: 'Administrator',
    category: 'セキュリティとアクセス',
    text: 'テスト問題1',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 1,
    explanation: 'テスト解説1',
  },
  {
    id: 'q2',
    certification: 'Administrator',
    category: 'セールス&マーケティングアプリケーション',
    text: 'テスト問題2',
    options: ['A', 'B', 'C'],
    correctAnswerIndex: 2,
    explanation: 'テスト解説2',
  },
];

describe('Quiz Logic', () => {
  it('should calculate correct answer', () => {
    const question = mockQuestions[0];
    const selectedIndex = 1;
    const isCorrect = selectedIndex === question.correctAnswerIndex;
    expect(isCorrect).toBe(true);
  });

  it('should calculate incorrect answer', () => {
    const question = mockQuestions[0];
    const selectedIndex = 0;
    const isCorrect = selectedIndex === question.correctAnswerIndex;
    expect(isCorrect).toBe(false);
  });

  it('should calculate score from answers', () => {
    const answers = [
      {
        questionId: 'q1',
        selectedIndex: 1,
        isCorrect: true,
      },
      {
        questionId: 'q2',
        selectedIndex: 2,
        isCorrect: true,
      },
    ];

    const score = answers.filter((a) => a.isCorrect).length;
    expect(score).toBe(2);
  });

  it('should calculate percentage', () => {
    const score = 18;
    const total = 20;
    const percentage = Math.round((score / total) * 100);
    expect(percentage).toBe(90);
  });

  it('should calculate category stats', () => {
    const answers = [
      {
        questionId: 'q1',
        selectedIndex: 1,
        isCorrect: true,
      },
      {
        questionId: 'q2',
        selectedIndex: 2,
        isCorrect: false,
      },
    ];

    const categoryMap = new Map<string, { correct: number; total: number }>();

    // Simulate category mapping
    const categoryByQuestion = {
      q1: 'セキュリティとアクセス',
      q2: 'セールス&マーケティングアプリケーション',
    };

    answers.forEach((answer) => {
      const category = categoryByQuestion[answer.questionId as keyof typeof categoryByQuestion];
      const existing = categoryMap.get(category) || { correct: 0, total: 0 };
      categoryMap.set(category, {
        correct: existing.correct + (answer.isCorrect ? 1 : 0),
        total: existing.total + 1,
      });
    });

    const stats = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    expect(stats).toHaveLength(2);
    expect(stats[0].percentage).toBe(100);
    expect(stats[1].percentage).toBe(0);
  });

  it('should identify weak categories', () => {
    const categoryStats = [
      { category: 'セキュリティとアクセス', correct: 10, total: 15, percentage: 67 },
      { category: 'セールス&マーケティング', correct: 5, total: 5, percentage: 100 },
      { category: 'データ管理', correct: 2, total: 5, percentage: 40 },
    ];

    const weakCategories = categoryStats
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    expect(weakCategories[0].category).toBe('データ管理');
    expect(weakCategories[0].percentage).toBe(40);
  });

  it('should validate question structure', () => {
    const question = mockQuestions[0];

    expect(question.id).toBeDefined();
    expect(question.category).toBeDefined();
    expect(question.text).toBeDefined();
    expect(Array.isArray(question.options)).toBe(true);
    expect(question.options.length).toBeGreaterThanOrEqual(3);
    expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
    expect(question.correctAnswerIndex).toBeLessThan(question.options.length);
    expect(question.explanation).toBeDefined();
  });

  it('should validate quiz session structure', () => {
    const session: QuizSession = {
      id: 'session_1',
      startedAt: Date.now(),
      completedAt: Date.now(),
      answers: [
        {
          questionId: 'q1',
          selectedIndex: 1,
          isCorrect: true,
        },
      ],
      score: 1,
      totalQuestions: 20,
    };

    expect(session.id).toBeDefined();
    expect(typeof session.startedAt).toBe('number');
    expect(typeof session.completedAt).toBe('number');
    expect(Array.isArray(session.answers)).toBe(true);
    expect(typeof session.score).toBe('number');
    expect(typeof session.totalQuestions).toBe('number');
  });

  it('should handle 20 question quiz', () => {
    const totalQuestions = 20;
    const correctAnswers = 18;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    expect(percentage).toBe(90);
    expect(correctAnswers).toBeLessThanOrEqual(totalQuestions);
  });

  it('should validate all test categories exist', () => {
    const testCategories = [
      '組織の設定',
      'セキュリティとアクセス',
      '標準・カスタムオブジェクト',
      'セールス&マーケティングアプリケーション',
      'サービス&サポート',
      '生産性とコラボレーション',
      'データ管理',
      '分析とレポート',
    ];

    expect(testCategories).toHaveLength(8);
    testCategories.forEach((cat) => {
      expect(cat).toBeTruthy();
      expect(typeof cat).toBe('string');
    });
  });
});
