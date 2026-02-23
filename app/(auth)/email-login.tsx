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

export default function EmailLoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const { login } = useAuth({ autoFetch: false });
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

      if (isSignUp && password.length < 8) {
        setError("パスワードは8文字以上である必要があります");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("[EmailLogin] Attempting login with email:", email, "isSignUp:", isSignUp);

      await login(email, password);
      console.log("[EmailLogin] Login successful");

      // Navigate to home
      router.replace("/(tabs)");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      console.error("[EmailLogin] Error:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
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
      alignItems: "center",
    },
    backButton: {
      marginBottom: 16,
      padding: 8,
    },
    backText: {
      fontSize: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.foreground,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      textAlign: "center",
    },
    errorContainer: {
      backgroundColor: colors.error + "20",
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      width: "100%",
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      textAlign: "center",
    },
    inputGroup: {
      marginBottom: 16,
      width: "100%",
    },
    inputLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
    },
    forgotLink: {
      fontSize: 12,
      color: colors.primary,
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
    helperText: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 8,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 8,
      marginBottom: 24,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background,
    },
    toggleSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      marginBottom: 24,
    },
    toggleText: {
      fontSize: 14,
      color: colors.muted,
    },
    toggleLink: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    footer: {
      alignItems: "center",
      marginTop: 16,
      paddingHorizontal: 24,
    },
    footerText: {
      fontSize: 12,
      color: colors.muted,
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
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>{isSignUp ? "アカウント作成" : "ログイン"}</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "新しいアカウントを作成" : "メールアドレスでログイン"}
          </Text>
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
            placeholder="example@email.com"
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
          <View style={styles.inputLabelRow}>
            <Text style={styles.label}>パスワード</Text>
            {!isSignUp && (
              <Pressable
                onPress={() => router.navigate({ pathname: "/(auth)/forgot-password" })}
                disabled={isLoading}
              >
                <Text style={styles.forgotLink}>忘れた場合</Text>
              </Pressable>
            )}
          </View>
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
          {isSignUp && <Text style={styles.helperText}>8文字以上のパスワードを設定してください</Text>}
        </View>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: isLoading ? colors.primary + "80" : colors.primary },
            pressed && !isLoading && { opacity: 0.8 },
          ]}
        >
          {isLoading && <ActivityIndicator color={colors.background} size="small" />}
          <Text style={styles.buttonText}>
            {isLoading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </Text>
        </Pressable>

        {/* Toggle Sign Up / Login */}
        <Pressable
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setPassword("");
          }}
          disabled={isLoading}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <View style={styles.toggleSection}>
            <Text style={styles.toggleText}>
              {isSignUp ? "既にアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
            </Text>
            <Text style={styles.toggleLink}>{isSignUp ? "ログイン" : "アカウント作成"}</Text>
          </View>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isSignUp
              ? "アカウント作成することでプライバシーポリシーに同意します"
              : "安全なログインをお楽しみください"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
