import { ScrollView, Text, View, Pressable, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import questions from '@/lib/questions.json';
import type { Question } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const CATEGORIES = [
  'セキュリティとアクセス',
  'セールス&マーケティングアプリケーション',
  'データ管理',
  '分析とレポート',
  '標準・カスタムオブジェクト',
  '生産性とコラボレーション',
  'サービス&サポート',
  'その他',
  '組織の設定',
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { sessions, loadSessions, getCategoryStats, initializeWeakPointQuiz, selectedCertification, initializeCategoryQuiz } = useQuiz();
  const { user, logout } = useAuth();
  const [incorrectCount, setIncorrectCount] = useState(0);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let count = 0;
    sessions.forEach((session) => {
      session.answers.forEach((answer) => {
        if (!answer.isCorrect) {
          count++;
        }
      });
    });
    setIncorrectCount(count);
  }, [sessions]);

  const handleStartQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const filteredQuestions = (questions as Question[]).filter(
      (q) => q.certification === selectedCertification
    );
    router.push('/(tabs)/quiz');
  };

  const handleStartCategoryQuiz = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const filteredQuestions = (questions as Question[]).filter(
      (q) => q.certification === selectedCertification
    );
    initializeCategoryQuiz(category, filteredQuestions);
    router.push('/(tabs)/quiz');
  };

  const handleStartWeakPointQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const filteredQuestions = (questions as Question[]).filter(
      (q) => q.certification === selectedCertification
    );
    initializeWeakPointQuiz(sessions, filteredQuestions);
    router.push('/(tabs)/quiz');
  };

  const categoryStats = getCategoryStats(sessions);
  const weakCategories = categoryStats
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const averageScore = totalSessions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const maxScore = sessions.length > 0 ? Math.max(...sessions.map(s => Math.round((s.score / s.totalQuestions) * 100))) : 0;

  const styles = StyleSheet.create({
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
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 8,
    },
    headerTop: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    logoutButton: {
      backgroundColor: colors.error + '20',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    logoutText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.error,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 8,
    },
    userInfo: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 8,
    },
    mainCTA: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    mainEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    mainButtonText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.background,
      marginBottom: 8,
    },
    mainButtonSubtext: {
      fontSize: 14,
      color: colors.background + '80',
    },
    weakPointCTA: {
      backgroundColor: colors.warning + '20',
      borderWidth: 2,
      borderColor: colors.warning,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    weakPointEmoji: {
      fontSize: 36,
      marginBottom: 8,
    },
    weakPointTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.warning,
      marginBottom: 4,
    },
    weakPointSubtext: {
      fontSize: 14,
      color: colors.warning + '80',
      marginBottom: 8,
    },
    weakPointHint: {
      fontSize: 12,
      color: colors.warning + '60',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 16,
    },
    categoryContainer: {
      marginBottom: 16,
      gap: 8,
    },
    categoryItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      flex: 1,
    },
    categoryArrow: {
      fontSize: 16,
      color: colors.primary,
    },
    statsContainer: {
      marginBottom: 24,
    },
    statItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 14,
      color: colors.muted,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    statValueSuccess: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.success,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 20,
    },
    weakPointsBox: {
      backgroundColor: colors.warning + '10',
      borderWidth: 1,
      borderColor: colors.warning + '30',
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    weakPointsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.warning,
      marginBottom: 12,
    },
    weakPointItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    weakPointItemText: {
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
    },
    weakPointItemScore: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.error,
    },
    detailStatsButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    detailStatsText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }} />
            {user && (
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.logoutText}>ログアウト</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.title}>SF Admin Quiz</Text>
          <Text style={styles.subtitle}>Salesforce認定アドミニストレーター試験対策</Text>
          {user && (
            <Text style={styles.userInfo}>
              ログイン: {user.name || user.email}
            </Text>
          )}
        </View>

        {/* メインCTA */}
        <Pressable
          onPress={handleStartQuiz}
          style={({ pressed }) => [
            styles.mainCTA,
            pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={styles.mainEmoji}>📚</Text>
          <Text style={styles.mainButtonText}>クイズを始める</Text>
          <Text style={styles.mainButtonSubtext}>10問出題・即時フィードバック</Text>
        </Pressable>

        {/* 苦手克服モード */}
        {incorrectCount > 0 && (
          <Pressable
            onPress={handleStartWeakPointQuiz}
            style={({ pressed }) => [
              styles.weakPointCTA,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.weakPointEmoji}>🎯</Text>
            <Text style={styles.weakPointTitle}>苦手克服モード</Text>
            <Text style={styles.weakPointSubtext}>
              不正解だった{incorrectCount}問を復習
            </Text>
            <Text style={styles.weakPointHint}>タップして開始</Text>
          </Pressable>
        )}

        {/* カテゴリセクション */}
        <Text style={styles.sectionTitle}>📚 カテゴリから学ぶ</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              onPress={() => handleStartCategoryQuiz(category)}
              style={({ pressed }) => [
                styles.categoryItem,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.categoryText}>{category}</Text>
              <Text style={styles.categoryArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* 統計情報 */}
        {totalSessions > 0 ? (
          <>
            <Text style={styles.sectionTitle}>📊 成績サマリー</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>受験回数</Text>
                <Text style={styles.statValue}>{totalSessions}回</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>平均スコア</Text>
                <Text style={styles.statValueSuccess}>{averageScore}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最高スコア</Text>
                <Text style={styles.statValue}>{maxScore}%</Text>
              </View>
            </View>

            {/* 弱点カテゴリ */}
            {weakCategories.length > 0 && (
              <View style={styles.weakPointsBox}>
                <Text style={styles.weakPointsTitle}>⚠️ 弱点カテゴリ</Text>
                {weakCategories.map((cat, index) => (
                  <View key={index} style={styles.weakPointItem}>
                    <Text style={styles.weakPointItemText}>{cat.category}</Text>
                    <Text style={styles.weakPointItemScore}>{cat.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 詳細統計ボタン */}
            <Pressable
              onPress={() => router.push('/stats')}
              style={({ pressed }) => [
                styles.detailStatsButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.detailStatsText}>詳細な統計を見る →</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              まだクイズを受験していません。{'\n'}「クイズを始める」をタップして開始しましょう！
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
