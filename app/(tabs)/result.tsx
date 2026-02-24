import React, { useEffect } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizSession } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, resetQuiz, sessions, loadSessions, getCategoryStats } = useQuiz();
  const { isAuthenticated } = useAuth();
  const saveResultMutation = trpc.quiz.saveResult.useMutation();

  const createStyles = () => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    modeBadge: {
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    modeBadgeText: {
      fontSize: 12,
      fontWeight: '700' as const,
    },
    scoreSection: {
      alignItems: 'center' as const,
      gap: 16,
      marginBottom: 32,
      marginTop: 32,
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: '700' as const,
    },
    percentage: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    scoreMessage: {
      fontSize: 14,
    },
    scoreBox: {
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 24,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    scoreProgressBar: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden' as const,
      marginBottom: 16,
    },
    scoreProgressFill: {
      height: '100%' as const,
      borderRadius: 4,
    },
    scoreRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      marginTop: 8,
    },
    scoreLabel: {
      fontSize: 14,
    },
    scoreCount: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    categorySection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
      marginBottom: 16,
    },
    categoryItem: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    categoryHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '600' as const,
      flex: 1,
    },
    categoryScore: {
      fontSize: 14,
      fontWeight: '700' as const,
    },
    categoryProgressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden' as const,
    },
    categoryProgressFill: {
      height: '100%' as const,
      borderRadius: 3,
    },
    categoryDetail: {
      fontSize: 12,
      marginTop: 8,
    },
    weakPointsBox: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    weakPointsTitle: {
      fontSize: 14,
      fontWeight: '700' as const,
      marginBottom: 12,
    },
    weakPointItem: {
      fontSize: 14,
      marginBottom: 8,
    },
    weakPointsHint: {
      fontSize: 12,
      marginTop: 12,
    },
    buttonContainer: {
      gap: 12,
      marginTop: 'auto' as const,
    },
    button: {
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
  });

  useEffect(() => {
    saveSession();
  }, []);

  const saveSession = async () => {
    try {
      const session: QuizSession = {
        id: `session_${Date.now()}`,
        startedAt: Date.now(),
        completedAt: Date.now(),
        answers: state.answers,
        score: state.score,
        totalQuestions: state.questions.length,
      };

      const stored = await AsyncStorage.getItem('quizSessions');
      const sessionsList = stored ? JSON.parse(stored) : [];
      sessionsList.push(session);
      await AsyncStorage.setItem('quizSessions', JSON.stringify(sessionsList));
      await loadSessions();

      if (isAuthenticated) {
        const categoryResults: Record<string, { correct: number; total: number }> = {};
        state.answers.forEach((answer) => {
          const question = state.questions.find((q) => q.id === answer.questionId);
          if (question) {
            if (!categoryResults[question.category]) {
              categoryResults[question.category] = { correct: 0, total: 0 };
            }
            categoryResults[question.category].total++;
            if (answer.isCorrect) {
              categoryResults[question.category].correct++;
            }
          }
        });

        const wrongQuestionIds = state.answers
          .filter((a) => !a.isCorrect)
          .map((a) => parseInt(a.questionId, 10));

        await saveResultMutation.mutateAsync({
          mode: state.mode === 'weak-point' ? 'weakPoints' : 'normal',
          totalQuestions: state.questions.length,
          correctAnswers: state.score,
          score: Math.round((state.score / state.questions.length) * 100),
          categoryResults,
          wrongQuestionIds,
        });
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const categoryStats = getCategoryStats(sessions);
  const percentage = Math.round((state.score / state.questions.length) * 100);

  const weakCategories = categoryStats
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetQuiz();
    router.push('/(tabs)/quiz');
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetQuiz();
    router.push('/(tabs)');
  };

  const styles = createStyles();

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* モード表示 */}
        {state.mode === 'weak-point' && (
          <View style={[styles.modeBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning, borderWidth: 1 }]}>
            <Text style={[styles.modeBadgeText, { color: colors.warning }]}>🎯 苦手克服モードの結果</Text>
          </View>
        )}
        {state.mode === 'category' && (
          <View style={[styles.modeBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }]}>
            <Text style={[styles.modeBadgeText, { color: colors.primary }]}>📚 カテゴリ別クイズの結果</Text>
          </View>
        )}

        {/* スコア表示 */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {state.score}/{state.questions.length}
          </Text>
          <Text style={[styles.percentage, { color: colors.foreground }]}>
            {percentage}%
          </Text>
          <Text style={[styles.scoreMessage, { color: colors.muted }]}>
            {percentage >= 80 ? '素晴らしい！' : percentage >= 60 ? '良好です' : 'もう一度挑戦しましょう'}
          </Text>
        </View>

        {/* スコアボックス */}
        <View style={[styles.scoreBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.scoreProgressBar, { backgroundColor: colors.border }]}>
            <View
              style={[styles.scoreProgressFill, { width: `${percentage}%`, backgroundColor: getScoreColor(percentage) }]}
            />
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: colors.muted }]}>正解</Text>
            <Text style={[styles.scoreCount, { color: colors.foreground }]}>
              {state.score}問
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: colors.muted }]}>不正解</Text>
            <Text style={[styles.scoreCount, { color: colors.foreground }]}>
              {state.questions.length - state.score}問
            </Text>
          </View>
        </View>

        {/* カテゴリ別成績 */}
        <View style={styles.categorySection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            カテゴリ別の成績
          </Text>
          {categoryStats.map((stat, index) => (
            <View key={index} style={[styles.categoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: colors.foreground }]}>
                  {stat.category}
                </Text>
                <Text style={[styles.categoryScore, { color: getScoreColor(stat.percentage) }]}>
                  {stat.percentage}%
                </Text>
              </View>
              <View style={[styles.categoryProgressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.categoryProgressFill, { width: `${stat.percentage}%`, backgroundColor: getScoreColor(stat.percentage) }]}
                />
              </View>
              <Text style={[styles.categoryDetail, { color: colors.muted }]}>
                {stat.correct}/{stat.total}問正解
              </Text>
            </View>
          ))}
        </View>

        {/* 弱点分析 */}
        {weakCategories.length > 0 && (
          <View style={[styles.weakPointsBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
            <Text style={[styles.weakPointsTitle, { color: colors.warning }]}>
              📌 弱点分析
            </Text>
            {weakCategories.map((cat, index) => (
              <Text key={index} style={[styles.weakPointItem, { color: colors.foreground }]}>
                • {cat.category}: {cat.percentage}% ({cat.correct}/{cat.total})
              </Text>
            ))}
            <Text style={[styles.weakPointsHint, { color: colors.muted }]}>
              これらのカテゴリを重点的に復習することをお勧めします。
            </Text>
          </View>
        )}

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              もう一度挑戦
            </Text>
          </Pressable>

          <Pressable
            onPress={handleHome}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.foreground }]}>
              ホームへ戻る
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
