import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { requestPasswordReset, resetPassword } from "@/lib/_core/api";

type Step = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestReset = async () => {
    try {
      if (!email) {
        setError("メールアドレスを入力してください");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("[ForgotPassword] Requesting password reset for:", email);

      await requestPasswordReset(email);
      console.log("[ForgotPassword] Reset request sent");

      setSuccess("リセット用コードをメールで送信しました");
      setTimeout(() => {
        setStep("code");
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "リクエストに失敗しました";
      console.error("[ForgotPassword] Error:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!code || !newPassword || !confirmPassword) {
        setError("すべてのフィールドを入力してください");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }

      if (newPassword.length < 8) {
        setError("パスワードは8文字以上である必要があります");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("[ForgotPassword] Resetting password");

      await resetPassword(code, newPassword);
      console.log("[ForgotPassword] Password reset successful");

      setSuccess("パスワードをリセットしました");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "リセットに失敗しました";
      console.error("[ForgotPassword] Error:", err);
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
              パスワードリセット
            </Text>
            <Text className="text-sm text-muted">
              {step === "email"
                ? "登録済みのメールアドレスを入力"
                : step === "code"
                  ? "メールで受け取ったコードを入力"
                  : "新しいパスワードを設定"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 w-full">
              <Text className="text-error text-center text-sm">{error}</Text>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View className="bg-success/10 border border-success rounded-lg p-4 w-full">
              <Text className="text-success text-center text-sm">{success}</Text>
            </View>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <>
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

              <Pressable
                onPress={handleRequestReset}
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
                        送信中...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-base font-semibold text-background">
                      リセットコードを送信
                    </Text>
                  )}
                </View>
              </Pressable>
            </>
          )}

          {/* Step 2: Code */}
          {step === "code" && (
            <>
              <View className="w-full gap-2">
                <Text className="text-sm font-semibold text-foreground">リセットコード</Text>
                <TextInput
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  value={code}
                  onChangeText={setCode}
                  editable={!isLoading}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground text-center text-lg"
                  style={{
                    color: colors.foreground,
                  }}
                />
                <Text className="text-xs text-muted text-center">
                  メールで受け取った6桁のコードを入力してください
                </Text>
              </View>

              <Pressable
                onPress={() => setStep("password")}
                disabled={isLoading || code.length !== 6}
                style={({ pressed }) => [
                  {
                    opacity: pressed && !isLoading && code.length === 6 ? 0.8 : 1,
                  },
                ]}
                className="w-full"
              >
                <View
                  className={`flex-row items-center justify-center gap-2 px-6 py-4 rounded-full ${
                    code.length === 6 ? "bg-primary" : "bg-primary/50"
                  }`}
                >
                  <Text className="text-base font-semibold text-background">
                    次へ
                  </Text>
                </View>
              </Pressable>
            </>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <>
              <View className="w-full gap-2">
                <Text className="text-sm font-semibold text-foreground">新しいパスワード</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                  secureTextEntry
                  className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
                  style={{
                    color: colors.foreground,
                  }}
                />
              </View>

              <View className="w-full gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  パスワード（確認）
                </Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                  secureTextEntry
                  className="px-4 py-3 rounded-lg bg-surface border border-border text-foreground"
                  style={{
                    color: colors.foreground,
                  }}
                />
                <Text className="text-xs text-muted">
                  8文字以上のパスワードを設定してください
                </Text>
              </View>

              <Pressable
                onPress={handleResetPassword}
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
                      パスワードをリセット
                    </Text>
                  )}
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setStep("code");
                  setError(null);
                }}
                disabled={isLoading}
              >
                <Text className="text-sm text-primary">戻る</Text>
              </Pressable>
            </>
          )}

          {/* Footer */}
          <View className="items-center gap-2 px-6 mt-4">
            <Text className="text-xs text-muted text-center">
              セキュアなパスワードリセットをお楽しみください
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
