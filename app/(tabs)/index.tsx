import { ScrollView, Text, View, Pressable, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
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
    // 不正解問題の数を計算
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

  // 統計情報を計算
  const totalSessions = sessions.length;
  const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const averageScore = totalSessions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const maxScore = sessions.length > 0 ? Math.max(...sessions.map(s => Math.round((s.score / s.totalQuestions) * 100))) : 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View className="items-center gap-2 mb-4 mt-4">
          <View className="w-full flex-row justify-between items-center mb-2">
            <View className="flex-1" />
            {user && (
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-error/10 rounded-lg px-3 py-2">
                  <Text className="text-xs font-semibold text-error">ログアウト</Text>
                </View>
              </Pressable>
            )}
          </View>
          <Text className="text-4xl font-bold text-primary">
            SF Admin Quiz
          </Text>
          <Text className="text-base text-muted">
            Salesforce認定アドミニストレーター試験対策
          </Text>
          {user && (
            <Text className="text-xs text-muted mt-2">
              ログイン: {user.name || user.email}
            </Text>
          )}
        </View>

        {/* メインCTA - 通常モード */}
        <Pressable
          onPress={handleStartQuiz}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <View className="bg-primary rounded-2xl p-8 items-center justify-center mb-6">
            <Text className="text-5xl mb-3">📚</Text>
            <Text className="text-2xl font-bold text-background mb-2">
              クイズを始める
            </Text>
            <Text className="text-sm text-background/80">
              10問出題・即時フィードバック
            </Text>
          </View>
        </Pressable>

        {/* 苦手克服モード CTA */}
        {incorrectCount > 0 && (
          <Pressable
            onPress={handleStartWeakPointQuiz}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View className="bg-warning/20 border-2 border-warning rounded-2xl p-6 items-center justify-center mb-8">
              <Text className="text-4xl mb-2">🎯</Text>
              <Text className="text-xl font-bold text-warning mb-1">
                苦手克服モード
              </Text>
              <Text className="text-sm text-warning/80 mb-2">
                不正解だった{incorrectCount}問を復習
              </Text>
              <Text className="text-xs text-warning/60">
                タップして開始
              </Text>
            </View>
          </Pressable>
        )}

        {/* カテゴリ別クイズセクション */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            📚 カテゴリから学ぶ
          </Text>
          <View className="gap-2">
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => handleStartCategoryQuiz(category)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center">
                  <Text className="text-sm font-semibold text-foreground flex-1">
                    {category}
                  </Text>
                  <Text className="text-lg text-primary">→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 統計情報 */}
        {totalSessions > 0 ? (
          <>
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">
                📊 成績サマリー
              </Text>
              <View className="gap-3">
                <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                  <Text className="text-sm text-muted">受験回数</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {totalSessions}回
                  </Text>
                </View>
                <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                  <Text className="text-sm text-muted">平均スコア</Text>
                  <Text className="text-2xl font-bold text-success">
                    {averageScore}%
                  </Text>
                </View>
                <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
                  <Text className="text-sm text-muted">最高スコア</Text>
                  <Text className="text-2xl font-bold text-primary">
                    {maxScore}%
                  </Text>
                </View>
              </View>
            </View>

            {/* 弱点カテゴリ */}
            {weakCategories.length > 0 && (
              <View className="mb-6 bg-warning/10 rounded-lg p-4 border border-warning/30">
                <Text className="font-bold text-warning mb-3">
                  ⚠️ 弱点カテゴリ
                </Text>
                <View className="gap-2">
                  {weakCategories.map((cat, index) => (
                    <View key={index} className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground flex-1">
                        {cat.category}
                      </Text>
                      <Text className="text-sm font-bold text-error">
                        {cat.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View className="bg-surface rounded-lg p-6 border border-border items-center mb-6">
            <Text className="text-base text-muted text-center">
              まだクイズを受験していません。
              {'\n'}「クイズを始める」をタップして開始しましょう！
            </Text>
          </View>
        )}

        {/* 詳細統計へのリンク */}
        {totalSessions > 0 && (
          <Pressable
            onPress={() => router.push('/stats')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View className="bg-surface border border-border rounded-lg p-4 items-center">
              <Text className="font-semibold text-primary">
                詳細な統計を見る →
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
