import React, { useEffect } from 'react';
import { ScrollView, Text, View, Pressable, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';

export default function StatsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { sessions, loadSessions, getCategoryStats } = useQuiz();

  useEffect(() => {
    loadSessions();
  }, []);

  const categoryStats = getCategoryStats(sessions);
  const sortedSessions = [...sessions].sort((a, b) => b.completedAt! - a.completedAt!);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">
            📊 統計
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary font-semibold">戻る</Text>
          </Pressable>
        </View>

        {/* カテゴリ別正解率 */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            カテゴリ別の成績
          </Text>
          <View className="gap-3">
            {categoryStats
              .sort((a, b) => b.percentage - a.percentage)
              .map((stat, index) => (
                <View key={index} className="bg-surface rounded-lg p-4 border border-border">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-semibold text-foreground flex-1">
                      {stat.category}
                    </Text>
                    <Text
                      className={`font-bold text-sm ${
                        stat.percentage >= 80
                          ? 'text-success'
                          : stat.percentage >= 60
                          ? 'text-warning'
                          : 'text-error'
                      }`}
                    >
                      {stat.percentage}%
                    </Text>
                  </View>
                  <View className="h-2 bg-border rounded-full overflow-hidden mb-2">
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
                  <Text className="text-xs text-muted">
                    {stat.correct}/{stat.total}問正解
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* 受験履歴 */}
        <View>
          <Text className="text-lg font-bold text-foreground mb-4">
            受験履歴
          </Text>
          {sortedSessions.length > 0 ? (
            <View className="gap-3">
              {sortedSessions.map((session, index) => {
                const percentage = Math.round(
                  (session.score / session.totalQuestions) * 100
                );
                return (
                  <View
                    key={session.id}
                    className="bg-surface rounded-lg p-4 border border-border"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-semibold text-foreground">
                        {index + 1}回目
                      </Text>
                      <Text
                        className={`font-bold text-lg ${
                          percentage >= 80
                            ? 'text-success'
                            : percentage >= 60
                            ? 'text-warning'
                            : 'text-error'
                        }`}
                      >
                        {session.score}/{session.totalQuestions}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs text-muted">
                        {formatDate(session.completedAt || 0)}
                      </Text>
                      <Text className="text-sm font-semibold text-primary">
                        {percentage}%
                      </Text>
                    </View>
                    <View className="h-1.5 bg-border rounded-full overflow-hidden">
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
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-base text-muted text-center">
                受験履歴がありません
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
