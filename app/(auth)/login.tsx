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
        <View className="flex-1 justify-center items-center px-6 py-8 gap-6">
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
                  {isLoading && selectedMethod === "google" ? "ログイン中..." : "Google アカウントで続ける"}
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
                  {isLoading && selectedMethod === "microsoft" ? "ログイン中..." : "Microsoft アカウントで続ける"}
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
                  {isLoading && selectedMethod === "email" ? "ログイン中..." : "メールアドレスで続ける"}
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
