import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      alignItems: 'center' as const,
      gap: 8,
      marginBottom: 32,
      marginTop: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
    },
    headerSubtitle: {
      fontSize: 14,
    },
    certList: {
      marginBottom: 32,
      gap: 16,
    },
    certCard: {
      borderWidth: 2,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    certContent: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 16,
    },
    certIcon: {
      fontSize: 40,
    },
    certInfo: {
      flex: 1,
    },
    certName: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
    certDescription: {
      fontSize: 13,
      marginTop: 8,
      lineHeight: 18,
    },
    certBadges: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginTop: 12,
    },
    certBadge: {
      fontSize: 12,
      fontWeight: '600' as const,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
    },
    footer: {
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
    setCerts(certifications as Certification[]);
  }, []);

  const handleSelectCertification = (slug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCertification(slug);
    router.push('/(tabs)');
  };

  const styles = createStyles();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            資格を選択
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            学習したい Salesforce 認定資格を選んでください
          </Text>
        </View>

        {/* 資格一覧 */}
        <View style={styles.certList}>
          {certs.map((cert) => {
            const isSelected = selectedCertification === cert.slug;
            const isDisabled = cert.questionCount === 0;
            
            let bgColor = colors.surface;
            let borderColor = colors.border;
            let nameColor = colors.foreground;

            if (isSelected) {
              bgColor = colors.primary + '10';
              borderColor = colors.primary;
              nameColor = colors.primary;
            } else if (isDisabled) {
              bgColor = colors.surface + '80';
              borderColor = colors.border;
            }

            return (
              <Pressable
                key={cert.slug}
                onPress={() => handleSelectCertification(cert.slug)}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.certCard,
                  {
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
                    transform: [{ scale: isDisabled ? 1 : pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View style={styles.certContent}>
                  <Text style={styles.certIcon}>{cert.icon || '📚'}</Text>
                  <View style={styles.certInfo}>
                    <Text style={[styles.certName, { color: nameColor }]}>
                      {cert.name}
                    </Text>
                    <Text style={[styles.certDescription, { color: colors.muted }]}>
                      {cert.description}
                    </Text>
                    <View style={styles.certBadges}>
                      <Text style={[
                        styles.certBadge,
                        {
                          backgroundColor: cert.questionCount > 0 ? colors.success + '20' : colors.muted + '20',
                          color: cert.questionCount > 0 ? colors.success : colors.muted,
                        },
                      ]}>
                        {cert.questionCount > 0
                          ? `${cert.questionCount}問`
                          : '準備中'}
                      </Text>
                      {isSelected && (
                        <Text style={[
                          styles.certBadge,
                          {
                            backgroundColor: colors.primary + '20',
                            color: colors.primary,
                          },
                        ]}>
                          ✓ 選択中
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push('/(tabs)')}
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
              ホームに戻る
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
