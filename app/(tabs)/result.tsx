import React, { useEffect } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
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
    resetQuiz();
    router.push('/(tabs)/quiz');
  };

  const handleHome = () => {
    resetQuiz();
    router.push('/(tabs)');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {state.mode === 'weak-point' && (
          <View className="bg-warning/20 border border-warning rounded-lg p-2 mb-4 flex-row items-center">
            <Text className="text-xs font-bold text-warning">🎯 苦手克服モードの結果</Text>
          </View>
        )}
        {state.mode === 'category' && (
          <View className="bg-primary/20 border border-primary rounded-lg p-2 mb-4 flex-row items-center">
            <Text className="text-xs font-bold text-primary">📚 カテゴリ別クイズの結果</Text>
          </View>
        )}

        <View className="items-center gap-4 mb-8 mt-8">
          <Text className="text-5xl font-bold text-primary">
            {state.score}/{state.questions.length}
          </Text>
          <Text className="text-2xl font-semibold text-foreground">
            {percentage}%
          </Text>
          <Text className="text-base text-muted">
            {percentage >= 80 ? '素晴らしい！' : percentage >= 60 ? '良好です' : 'もう一度挑戦しましょう'}
          </Text>
        </View>

        <View className="bg-surface rounded-xl p-6 mb-6 border border-border">
          <View className="h-2 bg-border rounded-full overflow-hidden mb-4">
            <View
              className={`h-full rounded-full ${
                percentage >= 80
                  ? 'bg-success'
                  : percentage >= 60
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">正解</Text>
            <Text className="text-sm font-semibold text-foreground">
              {state.score}問
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-muted">不正解</Text>
            <Text className="text-sm font-semibold text-foreground">
              {state.questions.length - state.score}問
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            カテゴリ別の成績
          </Text>
          <View className="gap-3">
            {categoryStats.map((stat, index) => (
              <View key={index} className="bg-surface rounded-lg p-4 border border-border">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-semibold text-foreground flex-1">
                    {stat.category}
                  </Text>
                  <Text className={`font-bold text-sm ${
                    stat.percentage >= 80
                      ? 'text-success'
                      : stat.percentage >= 60
                      ? 'text-warning'
                      : 'text-error'
                  }`}>
                    {stat.percentage}%
                  </Text>
                </View>
                <View className="h-1.5 bg-border rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${
                      stat.percentage >= 80
                        ? 'bg-success'
                        : stat.percentage >= 60
                        ? 'bg-warning'
                        : 'bg-error'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </View>
                <Text className="text-xs text-muted mt-2">
                  {stat.correct}/{stat.total}問正解
                </Text>
              </View>
            ))}
          </View>
        </View>

        {weakCategories.length > 0 && (
          <View className="mb-6 bg-warning/10 rounded-lg p-4 border border-warning/30">
            <Text className="font-bold text-warning mb-3">
              📌 弱点分析
            </Text>
            <View className="gap-2">
              {weakCategories.map((cat, index) => (
                <Text key={index} className="text-sm text-foreground">
                  • {cat.category}: {cat.percentage}% ({cat.correct}/{cat.total})
                </Text>
              ))}
            </View>
            <Text className="text-xs text-muted mt-3">
              これらのカテゴリを重点的に復習することをお勧めします。
            </Text>
          </View>
        )}

        <View className="gap-3 mt-auto">
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View className="bg-primary py-4 rounded-lg items-center justify-center">
              <Text className="font-bold text-base text-background">
                もう一度挑戦
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleHome}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View className="bg-surface border border-border py-4 rounded-lg items-center justify-center">
              <Text className="font-bold text-base text-foreground">
                ホームへ戻る
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
