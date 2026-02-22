import React, { useEffect } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizSession } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function ResultScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, resetQuiz, sessions, loadSessions, getCategoryStats } = useQuiz();

  useEffect(() => {
    // セッションを保存
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
      const sessions = stored ? JSON.parse(stored) : [];
      sessions.push(session);
      await AsyncStorage.setItem('quizSessions', JSON.stringify(sessions));
      await loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const categoryStats = getCategoryStats(sessions);
  const percentage = Math.round((state.score / state.questions.length) * 100);

  // 弱点カテゴリを抽出（正解率が低い順）
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
        {/* スコア表示 */}
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

        {/* スコア評価 */}
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

        {/* カテゴリ別正解率 */}
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

        {/* 弱点分析 */}
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

        {/* ボタン */}
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
