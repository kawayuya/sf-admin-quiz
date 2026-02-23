import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

type LoginMethod = "google" | "microsoft" | "email" | null;

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod>(null);

  const handleLogin = async (method: LoginMethod) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedMethod(method);
      console.log("[LoginScreen] Starting login with method:", method);

      if (method === "email") {
        // メールアドレスでのログインは別画面に遷移
        router.navigate({
          pathname: "/(auth)/email-login",
        });
        return;
      }

      // Google / Microsoft の場合は OAuth ログイン
      await startOAuthLogin();
      // On native, the app will be reopened via deep link after OAuth callback
      // On web, the page will redirect to the OAuth portal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      console.error("[LoginScreen] Login error:", err);
      setError(errorMessage);
      setIsLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
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

          {/* Login Methods */}
          <View className="w-full max-w-sm gap-3">
            <Text className="text-sm font-semibold text-muted text-center mb-2">
              以下の方法でログイン
            </Text>

            {/* Google Login Button */}
            <Pressable
              onPress={() => handleLogin("google")}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  opacity: pressed && !isLoading ? 0.8 : 1,
                },
              ]}
            >
              <View className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-full bg-surface border-2 border-border">
                <Text className="text-xl">🔵</Text>
                <Text className="text-base font-semibold text-foreground">
                  {isLoading && selectedMethod === "google" ? "ログイン中..." : "Google でログイン"}
                </Text>
                {isLoading && selectedMethod === "google" && (
                  <ActivityIndicator color={colors.primary} size="small" />
                )}
              </View>
            </Pressable>

            {/* Microsoft Login Button */}
            <Pressable
              onPress={() => handleLogin("microsoft")}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  opacity: pressed && !isLoading ? 0.8 : 1,
                },
              ]}
            >
              <View className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-full bg-surface border-2 border-border">
                <Text className="text-xl">⬜</Text>
                <Text className="text-base font-semibold text-foreground">
                  {isLoading && selectedMethod === "microsoft" ? "ログイン中..." : "Microsoft でログイン"}
                </Text>
                {isLoading && selectedMethod === "microsoft" && (
                  <ActivityIndicator color={colors.primary} size="small" />
                )}
              </View>
            </Pressable>

            {/* Email Login Button */}
            <Pressable
              onPress={() => handleLogin("email")}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  opacity: pressed && !isLoading ? 0.8 : 1,
                },
              ]}
            >
              <View className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-full bg-surface border-2 border-border">
                <Text className="text-xl">✉️</Text>
                <Text className="text-base font-semibold text-foreground">
                  {isLoading && selectedMethod === "email" ? "ログイン中..." : "メールアドレスでログイン"}
                </Text>
                {isLoading && selectedMethod === "email" && (
                  <ActivityIndicator color={colors.primary} size="small" />
                )}
              </View>
            </Pressable>
          </View>

          {/* Footer Text */}
          <View className="items-center gap-2 px-6">
            <Text className="text-xs text-muted text-center">
              セキュアなログイン方法を選択してください
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
