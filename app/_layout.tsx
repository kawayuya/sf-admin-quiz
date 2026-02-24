import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, ActivityIndicator, View } from "react-native";

import { ThemeProvider } from "@/lib/theme-provider";
import { QuizProvider } from "@/lib/quiz-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { setupErrorHandler } from "@/lib/error-handler";
import { useAuth } from "@/hooks/use-auth";

// エラーハンドラーを初期化
setupErrorHandler();

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

function RootLayoutContent() {
  const router = useRouter();
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const { isAuthenticated, loading } = useAuth();

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  // Force redirect when auth state changes
  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    console.log("[RootLayout] Auth state changed:", { isAuthenticated, loading });

    // When user becomes unauthenticated, force redirect to login
    if (!isAuthenticated) {
      console.log("[RootLayout] Redirecting to login...");
      router.replace("/(auth)/login");
    }
    // When user becomes authenticated, force redirect to home
    else {
      console.log("[RootLayout] Redirecting to home...");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, router]);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </GestureHandlerRootView>
    );
  }

  const shouldOverrideSafeArea = Platform.OS === "web";

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QuizProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="oauth/callback" />
                </>
              ) : (
                <>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="oauth/callback" />
                </>
              )}
            </Stack>
            <StatusBar style="auto" />
          </QueryClientProvider>
        </trpc.Provider>
      </QuizProvider>
    </GestureHandlerRootView>
  );

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}
