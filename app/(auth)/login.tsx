import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("有効なメールアドレスを入力してください");
        setIsLoading(false);
        return;
      }

      console.log("[LoginScreen] Starting email login with:", email);
      await login(email, password);
      console.log("[LoginScreen] Login successful");
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
    <ScreenContainer className="justify-center px-6">
      {/* Title */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground mb-2">ログイン</Text>
        <Text className="text-sm text-muted">メールアドレスとパスワードでログイン</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      )}

      {/* Email Input */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">メールアドレス</Text>
        <TextInput
          placeholder="example@example.com"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
          className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
          style={{ color: colors.foreground }}
        />
      </View>

      {/* Password Input */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">パスワード</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          secureTextEntry
          className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
          style={{ color: colors.foreground }}
        />
      </View>

      {/* Forgot Password Link */}
      <Pressable onPress={() => router.navigate({ pathname: "/(auth)/forgot-password" })} disabled={isLoading} className="mb-6">
        <Text className="text-sm font-medium text-primary text-right">パスワードを忘れた場合</Text>
      </Pressable>

      {/* Login Button */}
      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        style={({ pressed }) => [{ opacity: pressed && !isLoading ? 0.8 : 1 }]}
        className="mb-6"
      >
        <View className="flex-row items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary">
          {isLoading && <ActivityIndicator color={colors.background} size="small" />}
          <Text className="text-base font-semibold text-background">
            {isLoading ? "ログイン中..." : "ログイン"}
          </Text>
        </View>
      </Pressable>

      {/* Signup Link */}
      <View className="border-t border-border pt-6">
        <Text className="text-sm text-muted text-center mb-3">アカウントをお持ちではありませんか？</Text>
        <Pressable
          onPress={handleSignup}
          disabled={isLoading}
          style={({ pressed }) => [{ opacity: pressed && !isLoading ? 0.8 : 1 }]}
        >
          <View className="px-6 py-3 rounded-lg border border-primary">
            <Text className="text-base font-semibold text-primary text-center">新規登録</Text>
          </View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
