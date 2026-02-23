import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    header: {
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.foreground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
    },
    errorContainer: {
      backgroundColor: colors.error + "20",
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 8,
    },
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.foreground,
      fontSize: 16,
    },
    forgotPassword: {
      marginBottom: 24,
      alignItems: "flex-end",
    },
    forgotPasswordText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
    },
    loginButton: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      marginBottom: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background,
    },
    signupSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 24,
    },
    signupLabel: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 12,
    },
    signupButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    signupButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ログイン</Text>
          <Text style={styles.subtitle}>メールアドレスとパスワードでログイン</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            placeholder="example@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>パスワード</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        {/* Forgot Password Link */}
        <Pressable
          onPress={() => router.navigate({ pathname: "/(auth)/forgot-password" })}
          disabled={isLoading}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>パスワードを忘れた場合</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && !isLoading && { opacity: 0.8 },
          ]}
        >
          {isLoading && <ActivityIndicator color={colors.background} size="small" />}
          <Text style={styles.loginButtonText}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Text>
        </Pressable>

        {/* Signup Section */}
        <View style={styles.signupSection}>
          <Text style={styles.signupLabel}>アカウントをお持ちではありませんか？</Text>
          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.signupButton,
              pressed && !isLoading && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.signupButtonText}>新規登録</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
