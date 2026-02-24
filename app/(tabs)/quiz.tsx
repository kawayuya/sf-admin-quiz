import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, Text, View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuiz } from '@/lib/quiz-context';
import { Question } from '@/lib/types';
import questions from '@/lib/questions.json';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';

export default function QuizScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, initializeQuiz, selectAnswer, submitAnswer, nextQuestion, completeQuiz } = useQuiz();
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<boolean>(false);

  const createStyles = () => StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeBadge: {
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    modeBadgeText: {
      fontSize: 12,
      fontWeight: '700' as const,
    },
    progressSection: {
      marginBottom: 24,
    },
    progressHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    progressCount: {
      fontSize: 12,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden' as const,
    },
    progressFill: {
      height: '100%' as const,
      borderRadius: 4,
    },
    categoryBadge: {
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: 'flex-start' as const,
      marginBottom: 16,
    },
    categoryBadgeText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    questionBox: {
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    questionText: {
      fontSize: 16,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
    optionsContainer: {
      marginBottom: 24,
      gap: 12,
    },
    optionButton: {
      borderWidth: 2,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 12,
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 12,
    },
    optionCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    optionCircleText: {
      fontSize: 14,
      fontWeight: '700' as const,
    },
    optionText: {
      fontSize: 14,
      fontWeight: '500' as const,
      flex: 1,
      lineHeight: 20,
    },
    optionIcon: {
      fontSize: 18,
    },
    feedbackBox: {
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    feedbackTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
      marginBottom: 8,
    },
    feedbackText: {
      fontSize: 14,
      lineHeight: 20,
    },
    buttonContainer: {
      gap: 12,
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
    if (state.questions.length > 0) {
      setIsLoading(false);
      return;
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    initializeQuiz(shuffled as Question[]);
    setIsLoading(false);
  }, [initializeQuiz, state.questions.length]);

  useEffect(() => {
    if (state.isQuizComplete && !navigationRef.current) {
      navigationRef.current = true;
      const timer = setTimeout(() => {
        router.push('/(tabs)/result');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.isQuizComplete, router]);

  if (isLoading || state.questions.length === 0) {
    const styles = createStyles();
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  const styles = createStyles();

  const handleSelectAnswer = (index: number) => {
    selectAnswer(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    if (state.selectedAnswerIndex !== null) {
      submitAnswer();
      const isCorrect = state.selectedAnswerIndex === currentQuestion.correctAnswerIndex;
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    }
  };

  const handleNext = () => {
    nextQuestion();
    if (state.currentQuestionIndex + 1 >= state.questions.length) {
      completeQuiz();
    }
  };

  const isCorrect = state.hasAnswered && state.answers[state.answers.length - 1]?.isCorrect;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* モード表示 */}
        {state.mode === 'weak-point' && (
          <View style={[styles.modeBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning, borderWidth: 1 }]}>
            <Text style={[styles.modeBadgeText, { color: colors.warning }]}>🎯 苦手克服モード</Text>
          </View>
        )}
        {state.mode === 'category' && (
          <View style={[styles.modeBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }]}>
            <Text style={[styles.modeBadgeText, { color: colors.primary }]}>📚 カテゴリ別クイズ</Text>
          </View>
        )}

        {/* プログレスバー */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>
              問題 {state.currentQuestionIndex + 1}/{state.questions.length}
            </Text>
            <Text style={[styles.progressCount, { color: colors.muted }]}>
              {state.answers.filter(a => a.isCorrect).length}/{state.currentQuestionIndex} 正解
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]}
            />
          </View>
        </View>

        {/* カテゴリバッジ */}
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{currentQuestion.category}</Text>
        </View>

        {/* 問題文 */}
        <View style={[styles.questionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.questionText, { color: colors.foreground }]}>{currentQuestion.text}</Text>
        </View>

        {/* 選択肢 */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = state.selectedAnswerIndex === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
            const showResult = state.hasAnswered;

            let bgColor = colors.surface;
            let borderColor = colors.border;
            let textColor = colors.foreground;
            let circleColor = colors.border;

            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = colors.success + '10';
                borderColor = colors.success;
                textColor = colors.success;
                circleColor = colors.success;
              } else if (isSelected && !isCorrect) {
                bgColor = colors.error + '10';
                borderColor = colors.error;
                textColor = colors.error;
                circleColor = colors.error;
              }
            } else if (isSelected) {
              bgColor = colors.primary + '10';
              borderColor = colors.primary;
              textColor = colors.primary;
              circleColor = colors.primary;
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleSelectAnswer(index)}
                disabled={state.hasAnswered}
                style={({ pressed }) => [
                  styles.optionButton,
                  {
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    opacity: pressed && !state.hasAnswered ? 0.7 : 1,
                  },
                ]}
              >
                <View style={[styles.optionCircle, { borderColor: circleColor }]}>
                  <Text style={[styles.optionCircleText, { color: circleColor }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {option}
                </Text>
                {showResult && isCorrectAnswer && (
                  <Text style={styles.optionIcon}>✓</Text>
                )}
                {showResult && isSelected && !isCorrect && (
                  <Text style={styles.optionIcon}>✗</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* フィードバック・解説 */}
        {state.hasAnswered && (
          <View style={[
            styles.feedbackBox,
            {
              backgroundColor: isCorrect ? colors.success + '10' : colors.error + '10',
            },
          ]}>
            <Text style={[
              styles.feedbackTitle,
              { color: isCorrect ? colors.success : colors.error },
            ]}>
              {isCorrect ? '✓ 正解！' : '✗ 不正解'}
            </Text>
            <Text style={[styles.feedbackText, { color: colors.foreground }]}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          {!state.hasAnswered ? (
            <Pressable
              onPress={handleSubmit}
              disabled={state.selectedAnswerIndex === null}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: state.selectedAnswerIndex === null
                    ? colors.muted + '30'
                    : colors.primary,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={[
                styles.buttonText,
                {
                  color: state.selectedAnswerIndex === null
                    ? colors.muted
                    : colors.background,
                },
              ]}>
                回答する
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleNext}
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
                {state.currentQuestionIndex + 1 === state.questions.length
                  ? '結果を見る'
                  : '次の問題へ'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
