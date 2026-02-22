import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
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

  // クイズを初期化（ランダムに20問を選択 or 苦手克服モード）
  useEffect(() => {
    // 既にクイズが初期化されている場合（苦手克服モード）はスキップ
    if (state.questions.length > 0) {
      setIsLoading(false);
      return;
    }
    
    // 通常モード：ランダムに20問を選択
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 20);
    initializeQuiz(shuffled as Question[]);
    setIsLoading(false);
  }, [initializeQuiz, state.questions.length]);

  // クイズ完了時の処理
  useEffect(() => {
    if (state.isQuizComplete && !navigationRef.current) {
      navigationRef.current = true;
      // 非同期で遷移を実行
      const timer = setTimeout(() => {
        router.push('/(tabs)/result');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.isQuizComplete, router]);

  if (isLoading || state.questions.length === 0) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

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
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* モード表示 */}
        {state.mode === 'weak-point' && (
          <View className="bg-warning/20 border border-warning rounded-lg p-2 mb-4 flex-row items-center">
            <Text className="text-xs font-bold text-warning">🎯 苦手克服モード</Text>
          </View>
        )}
        {state.mode === 'category' && (
          <View className="bg-primary/20 border border-primary rounded-lg p-2 mb-4 flex-row items-center">
            <Text className="text-xs font-bold text-primary">📚 カテゴリ別クイズ</Text>
          </View>
        )}

        {/* プログレスバー */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-foreground">
              問題 {state.currentQuestionIndex + 1}/{state.questions.length}
            </Text>
            <Text className="text-xs text-muted">
              {state.answers.filter(a => a.isCorrect).length}/{state.currentQuestionIndex} 正解
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* カテゴリバッジ */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full self-start">
            {currentQuestion.category}
          </Text>
        </View>

        {/* 問題文 */}
        <View className="bg-surface rounded-xl p-5 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground leading-relaxed">
            {currentQuestion.text}
          </Text>
        </View>

        {/* 選択肢 */}
        <View className="gap-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = state.selectedAnswerIndex === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
            const showResult = state.hasAnswered;

            let bgColor = 'bg-surface border-border';
            let textColor = 'text-foreground';

            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = 'bg-success/10 border-success';
                textColor = 'text-success';
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-error/10 border-error';
                textColor = 'text-error';
              }
            } else if (isSelected) {
              bgColor = 'bg-primary/10 border-primary';
              textColor = 'text-primary';
            }

            return (
              <Pressable
                key={index}
                onPress={() => handleSelectAnswer(index)}
                disabled={state.hasAnswered}
                style={({ pressed }) => [
                  {
                    opacity: pressed && !state.hasAnswered ? 0.7 : 1,
                  },
                ]}
              >
                <View className={`border-2 rounded-lg p-4 flex-row items-start gap-3 ${bgColor}`}>
                  <View className={`w-8 h-8 rounded-full border-2 border-current items-center justify-center ${textColor}`}>
                    <Text className={`font-bold ${textColor}`}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text className={`flex-1 text-base leading-relaxed ${textColor}`}>
                    {option}
                  </Text>
                  {showResult && isCorrectAnswer && (
                    <Text className="text-xl">✓</Text>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Text className="text-xl">✗</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* フィードバック・解説 */}
        {state.hasAnswered && (
          <View className={`rounded-lg p-4 mb-6 ${isCorrect ? 'bg-success/10' : 'bg-error/10'}`}>
            <Text className={`font-bold text-base mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
              {isCorrect ? '✓ 正解！' : '✗ 不正解'}
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        {/* ボタン */}
        <View className="gap-3">
          {!state.hasAnswered ? (
            <Pressable
              onPress={handleSubmit}
              disabled={state.selectedAnswerIndex === null}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                className={`py-4 rounded-lg items-center justify-center ${
                  state.selectedAnswerIndex === null
                    ? 'bg-muted/30'
                    : 'bg-primary'
                }`}
              >
                <Text
                  className={`font-bold text-base ${
                    state.selectedAnswerIndex === null
                      ? 'text-muted'
                      : 'text-background'
                  }`}
                >
                  回答する
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="bg-primary py-4 rounded-lg items-center justify-center">
                <Text className="font-bold text-base text-background">
                  {state.currentQuestionIndex + 1 === state.questions.length
                    ? '結果を見る'
                    : '次の問題へ'}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
