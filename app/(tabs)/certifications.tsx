import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useQuiz } from '@/lib/quiz-context';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import certifications from '@/lib/certifications.json';
import type { Certification } from '@/lib/types';

export default function CertificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { selectedCertification, setSelectedCertification } = useQuiz();
  const [certs, setCerts] = useState<Certification[]>([]);

  useEffect(() => {
    setCerts(certifications as Certification[]);
  }, []);

  const handleSelectCertification = (slug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCertification(slug);
    router.push('/(tabs)');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View className="items-center gap-2 mb-8 mt-4">
          <Text className="text-3xl font-bold text-primary">
            資格を選択
          </Text>
          <Text className="text-base text-muted">
            学習したい Salesforce 認定資格を選んでください
          </Text>
        </View>

        {/* 資格一覧 */}
        <View className="gap-4 mb-8">
          {certs.map((cert) => (
            <Pressable
              key={cert.slug}
              onPress={() => handleSelectCertification(cert.slug)}
              disabled={cert.questionCount === 0}
              style={({ pressed }) => [
                {
                  opacity: cert.questionCount === 0 ? 0.5 : pressed ? 0.9 : 1,
                  transform: [{ scale: cert.questionCount === 0 ? 1 : pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                className={`rounded-2xl p-6 border-2 ${
                  selectedCertification === cert.slug
                    ? 'bg-primary/10 border-primary'
                    : cert.questionCount === 0
                    ? 'bg-surface/50 border-border'
                    : 'bg-surface border-border'
                }`}
              >
                <View className="flex-row items-start gap-4">
                  <Text className="text-4xl">{cert.icon || '📚'}</Text>
                  <View className="flex-1">
                    <Text className={`text-lg font-bold ${
                      selectedCertification === cert.slug
                        ? 'text-primary'
                        : 'text-foreground'
                    }`}>
                      {cert.name}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {cert.description}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-3">
                      <Text className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        cert.questionCount > 0
                          ? 'bg-success/20 text-success'
                          : 'bg-muted/20 text-muted'
                      }`}>
                        {cert.questionCount > 0
                          ? `${cert.questionCount}問`
                          : '準備中'}
                      </Text>
                      {selectedCertification === cert.slug && (
                        <Text className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary">
                          ✓ 選択中
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* フッター */}
        <View className="mt-auto">
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View className="bg-primary py-4 rounded-lg items-center justify-center">
              <Text className="font-bold text-base text-background">
                ホームに戻る
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
