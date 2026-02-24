import React, { useEffect } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';

export default function StatsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { sessions, loadSessions, getCategoryStats } = useQuiz();

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
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700' as const,
    },
    backButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
      marginBottom: 16,
    },
    sectionContainer: {
      marginBottom: 32,
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
      justifyContent: 'space-between' as const,
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
      height: 8,
      borderRadius: 4,
      overflow: 'hidden' as const,
      marginBottom: 8,
    },
    categoryProgressFill: {
      height: '100%' as const,
      borderRadius: 4,
    },
    categoryDetail: {
      fontSize: 12,
    },
    sessionItem: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sessionHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    sessionNumber: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    sessionScore: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
    sessionInfo: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    sessionDate: {
      fontSize: 12,
    },
    sessionPercentage: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    sessionProgressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden' as const,
    },
    sessionProgressFill: {
      height: '100%' as const,
      borderRadius: 3,
    },
    emptyState: {
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center' as const,
    },
    emptyStateText: {
      fontSize: 14,
      textAlign: 'center' as const,
    },
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const categoryStats = getCategoryStats(sessions);
  const sortedSessions = [...sessions].sort((a, b) => b.completedAt! - a.completedAt!);
  const styles = createStyles();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            📊 統計
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>戻る</Text>
          </Pressable>
        </View>

        {/* カテゴリ別正解率 */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            カテゴリ別の成績
          </Text>
          {categoryStats
            .sort((a, b) => b.percentage - a.percentage)
            .map((stat, index) => (
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

        {/* 受験履歴 */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            受験履歴
          </Text>
          {sortedSessions.length > 0 ? (
            <View>
              {sortedSessions.map((session, index) => {
                const percentage = Math.round(
                  (session.score / session.totalQuestions) * 100
                );
                return (
                  <View
                    key={session.id}
                    style={[styles.sessionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.sessionHeader}>
                      <Text style={[styles.sessionNumber, { color: colors.foreground }]}>
                        {index + 1}回目
                      </Text>
                      <Text style={[styles.sessionScore, { color: getScoreColor(percentage) }]}>
                        {session.score}/{session.totalQuestions}
                      </Text>
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionDate, { color: colors.muted }]}>
                        {formatDate(session.completedAt || 0)}
                      </Text>
                      <Text style={[styles.sessionPercentage, { color: colors.primary }]}>
                        {percentage}%
                      </Text>
                    </View>
                    <View style={[styles.sessionProgressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[styles.sessionProgressFill, { width: `${percentage}%`, backgroundColor: getScoreColor(percentage) }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                受験履歴がありません
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
