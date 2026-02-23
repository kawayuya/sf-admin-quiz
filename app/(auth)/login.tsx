import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("[LoginScreen] Starting OAuth login...");
      await startOAuthLogin();
      // On native, the app will be reopened via deep link after OAuth callback
      // On web, the page will redirect to the OAuth portal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      console.error("[LoginScreen] Login error:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-gradient-to-b from-primary/10 to-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center px-6 py-8 gap-8">
          {/* Header Section */}
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
              <Text className="text-5xl">🎓</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">
                Salesforce Admin
              </Text>
              <Text className="text-3xl font-bold text-foreground">
                Quiz
              </Text>
              <Text className="text-base text-muted mt-2">
                認定試験対策アプリ
              </Text>
            </View>
          </View>

          {/* Description Section */}
          <View className="bg-surface rounded-2xl p-6 gap-4 w-full max-w-sm">
            <View className="gap-3">
              <View className="flex-row gap-3 items-start">
                <Text className="text-2xl">📚</Text>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    250問の過去問
                  </Text>
                  <Text className="text-sm text-muted">
                    最新の試験範囲に対応した問題集
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3 items-start">
                <Text className="text-2xl">⚡</Text>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    即座にフィードバック
                  </Text>
                  <Text className="text-sm text-muted">
                    各問題の詳細な解説付き
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3 items-start">
                <Text className="text-2xl">📊</Text>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    成績分析
                  </Text>
                  <Text className="text-sm text-muted">
                    弱点を自動抽出して対策
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 w-full max-w-sm">
              <Text className="text-error text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                opacity: pressed && !isLoading ? 0.8 : 1,
              },
            ]}
            className="w-full max-w-sm"
          >
            <View
              className={`flex-row items-center justify-center gap-2 px-6 py-4 rounded-full ${
                isLoading ? "bg-primary/50" : "bg-primary"
              }`}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color={colors.background} size="small" />
                  <Text className="text-lg font-semibold text-background">
                    ログイン中...
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-lg font-semibold text-background">
                    Salesforce でログイン
                  </Text>
                  <Text className="text-lg">→</Text>
                </>
              )}
            </View>
          </Pressable>

          {/* Footer Text */}
          <View className="items-center gap-2 px-6">
            <Text className="text-xs text-muted text-center">
              Salesforce アカウントでセキュアにログインします
            </Text>
            <Text className="text-xs text-muted text-center">
              初回ログイン時にアカウントが自動作成されます
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
