import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function EmailLoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("メールアドレスとパスワードを入力してください");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("[EmailLogin] Attempting login with email:", email);

      // TODO: API 呼び出しでログイン処理を実装
      // const response = await apiCall("/api/auth/email-login", {
      //   method: "POST",
      //   body: JSON.stringify({ email, password, isSignUp }),
      // });

      // ここでは仮の処理
      setTimeout(() => {
        setIsLoading(false);
        router.replace("/(tabs)");
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      console.error("[EmailLogin] Error:", err);
      setError(errorMessage);
      setIsLoading(false);
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
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">
              {isSignUp ? "アカウント作成" : "ログイン"}
            </Text>
            <Text className="text-sm text-muted">
              {isSignUp ? "新しいアカウントを作成" : "メールアドレスでログイン"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 w-full">
              <Text className="text-error text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="w-full gap-2">
            <Text className="text-sm font-semibold text-foreground">メールアドレス</Text>
            <TextInput
              placeholder="example@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
              style={{
                color: colors.foreground,
              }}
            />
          </View>

          {/* Password Input */}
          <View className="w-full gap-2">
            <Text className="text-sm font-semibold text-foreground">パスワード</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
              className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
              style={{
                color: colors.foreground,
              }}
            />
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                opacity: pressed && !isLoading ? 0.8 : 1,
              },
            ]}
            className="w-full"
          >
            <View
              className={`flex-row items-center justify-center gap-2 px-6 py-4 rounded-full ${
                isLoading ? "bg-primary/50" : "bg-primary"
              }`}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color={colors.background} size="small" />
                  <Text className="text-base font-semibold text-background">
                    処理中...
                  </Text>
                </>
              ) : (
                <Text className="text-base font-semibold text-background">
                  {isSignUp ? "アカウント作成" : "ログイン"}
                </Text>
              )}
            </View>
          </Pressable>

          {/* Toggle Sign Up / Login */}
          <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-muted">
                {isSignUp ? "既にアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
              </Text>
              <Text className="text-sm font-semibold text-primary">
                {isSignUp ? "ログイン" : "アカウント作成"}
              </Text>
            </View>
          </Pressable>

          {/* Footer */}
          <View className="items-center gap-2 px-6 mt-4">
            <Text className="text-xs text-muted text-center">
              プライバシーポリシーに同意してください
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
