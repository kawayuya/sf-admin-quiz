import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    console.log("[useAuth] fetchUser called");
    try {
      setLoading(true);
      setError(null);

      // Both Web and Native: call /api/auth/me to verify session
      // Web: uses session cookie (set by backend after OAuth callback)
      // Native: uses Bearer token from SecureStore
      console.log("[useAuth] Fetching user from /api/auth/me...");
      const apiUser = await Api.getMe();
      console.log("[useAuth] API user response:", apiUser);

      if (apiUser) {
        const userInfo: Auth.User = {
          id: apiUser.id,
          openId: apiUser.openId,
          name: apiUser.name,
          email: apiUser.email,
          loginMethod: apiUser.loginMethod,
          lastSignedIn: new Date(apiUser.lastSignedIn),
        };
        setUser(userInfo);
        console.log("[useAuth] User authenticated:", userInfo);
      } else {
        console.log("[useAuth] No authenticated user");
        setUser(null);
        // Clear any stored session info when authentication fails
        if (Platform.OS !== "web") {
          await Auth.removeSessionToken();
        }
        await Auth.clearUserInfo();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error:", error);
      setError(error);
      setUser(null);
      // Clear any stored session info when authentication fails
      if (Platform.OS !== "web") {
        await Auth.removeSessionToken().catch(() => {});
      }
      await Auth.clearUserInfo().catch(() => {});
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchUser completed, loading: false");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
      // Continue with logout even if API call fails
    } finally {
      await Auth.removeSessionToken().catch(() => {});
      await Auth.clearUserInfo().catch(() => {});
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    console.log("[useAuth] useEffect triggered, autoFetch:", autoFetch);
    if (autoFetch) {
      // Always fetch from /api/auth/me on app startup
      // This is the single source of truth for authentication state
      fetchUser();
    } else {
      console.log("[useAuth] autoFetch disabled, setting loading to false");
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  useEffect(() => {
    console.log("[useAuth] State updated:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      error: error?.message,
    });
  }, [user, loading, isAuthenticated, error]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
  };
}
