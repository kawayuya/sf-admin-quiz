import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate inputs
      if (!email.trim()) {
        setError("メールアドレスを入力してください");
        setIsLoading(false);
        return;
      }

      if (!password) {
        setError("パスワードを入力してください");
        setIsLoading(false);
        return;
      }

      // Email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("有効なメールアドレスを入力してください");
        setIsLoading(false);
        return;
      }

      console.log("[LoginScreen] Starting email login with:", email);

      // Call login API
      await login(email, password);

      console.log("[LoginScreen] Login successful");
      // Navigation will be handled by useAuth hook
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      console.error("[LoginScreen] Login error:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    router.navigate({
      pathname: "/(auth)/email-login",
    });
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
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">ログイン</Text>
            <Text className="text-sm text-muted">メールアドレスでログイン</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 w-full max-w-sm">
              <Text className="text-error text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Login Form */}
          <View className="w-full max-w-sm gap-4">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">メールアドレス</Text>
              <TextInput
                placeholder="example@example.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
                style={{
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">パスワード</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
                style={{
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.navigate({ pathname: "/(auth)/forgot-password" })}
              disabled={isLoading}
            >
              <Text className="text-sm text-primary text-right">パスワードを忘れた場合</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  opacity: pressed && !isLoading ? 0.8 : isLoading ? 0.6 : 1,
                },
              ]}
            >
              <View className="flex-row items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary">
                <Text className="text-base font-semibold text-background">
                  {isLoading ? "ログイン中..." : "ログイン"}
                </Text>
                {isLoading && <ActivityIndicator color={colors.background} size="small" />}
              </View>
            </Pressable>
          </View>

          {/* Signup Link */}
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-sm text-muted">アカウントをお持ちではありませんか？</Text>
            <Pressable onPress={handleSignup} disabled={isLoading}>
              <Text className="text-sm font-semibold text-primary">新規登録</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
