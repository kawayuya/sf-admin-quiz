import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Determine the auth method:
  // - Native platform: use stored session token as Bearer auth
  // - Web (including iframe): use cookie-based auth (browser handles automatically)
  //   Cookie is set on backend domain via POST /api/auth/session after receiving token via postMessage
  if (Platform.OS !== "web") {
    const sessionToken = await Auth.getSessionToken();
    console.log("[API] apiCall:", {
      endpoint,
      hasToken: !!sessionToken,
      method: options.method || "GET",
    });
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
      console.log("[API] Authorization header added");
    }
  } else {
    const memoryToken = (global as any).__sessionToken;
    if (memoryToken) {
      headers["Authorization"] = `Bearer ${memoryToken}`;
      console.log("[API] Web platform: using Bearer token from memory");
    } else {
      console.log("[API] Web platform: using cookie-based auth");
    }
  }

  const baseUrl = getApiBaseUrl();
  // Ensure no double slashes between baseUrl and endpoint
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${cleanBaseUrl}${cleanEndpoint}` : endpoint;
  console.log("[API] Full URL:", url);

  try {
    console.log("[API] Making request...");
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    console.log("[API] Response status:", response.status, response.statusText);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log("[API] Response headers:", responseHeaders);

    // Check if Set-Cookie header is present (cookies are automatically handled in React Native)
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      console.log("[API] Set-Cookie header received:", setCookie);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Error response:", errorText);
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as is
      }
      throw new Error(errorMessage || `API call failed: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("[API] JSON response received");
      return data as T;
    }

    const text = await response.text();
    console.log("[API] Text response received");
    return (text ? JSON.parse(text) : {}) as T;
  } catch (error) {
    console.error("[API] Request failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

// OAuth callback handler - exchange code for session token
// Calls /api/oauth/mobile endpoint which returns JSON with app_session_id and user
export async function exchangeOAuthCode(
  code: string,
  state: string,
): Promise<{ sessionToken: string; user: any }> {
  console.log("[API] exchangeOAuthCode called");
  // Use GET with query params
  const params = new URLSearchParams({ code, state });
  const endpoint = `/api/oauth/mobile?${params.toString()}`;
  console.log("[API] Calling OAuth mobile endpoint:", endpoint);
  const result = await apiCall<{ app_session_id: string; user: any }>(endpoint);

  // Convert app_session_id to sessionToken for compatibility
  const sessionToken = result.app_session_id;
  console.log("[API] OAuth exchange result:", {
    hasSessionToken: !!sessionToken,
    hasUser: !!result.user,
    sessionToken: sessionToken ? `${sessionToken.substring(0, 50)}...` : null,
  });

  return {
    sessionToken,
    user: result.user,
  };
}

// Logout
export async function logout(): Promise<void> {
  await apiCall<void>("/api/auth/logout", {
    method: "POST",
  });
}

// Get current authenticated user (web uses cookie-based auth)
export async function getMe(): Promise<{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
} | null> {
  try {
    const result = await apiCall<{ user: any }>("/api/auth/me");
    return result.user || null;
  } catch (error) {
    console.error("[API] getMe failed:", error);
    return null;
  }
}

// Establish session cookie on the backend (3000-xxx domain)
// Called after receiving token via postMessage to get a proper Set-Cookie from the backend
export async function establishSession(token: string): Promise<boolean> {
  try {
    console.log("[API] establishSession: setting cookie on backend...");
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/auth/session`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Important: allows Set-Cookie to be stored
    });

    if (!response.ok) {
      console.error("[API] establishSession failed:", response.status);
      return false;
    }

    console.log("[API] establishSession: cookie set successfully");
    return true;
  } catch (error) {
    console.error("[API] establishSession error:", error);
    return false;
  }
}


// Email login - sign up or login
export async function emailLogin(
  email: string,
  password: string,
  isSignUp: boolean,
): Promise<{ sessionToken: string; user: any }> {
  try {
    console.log("[API] emailLogin called:", { email, isSignUp });
    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/email-login";
    const result = await apiCall<{ app_session_id: string; user: any }>(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const sessionToken = result.app_session_id;
    console.log("[API] Email login result:", {
      hasSessionToken: !!sessionToken,
      hasUser: !!result.user,
    });

    return {
      sessionToken,
      user: result.user,
    };
  } catch (error) {
    console.error("[API] emailLogin failed:", error);
    throw error;
  }
}

// Google OAuth login
export async function googleLogin(idToken: string): Promise<{ sessionToken: string; user: any }> {
  try {
    console.log("[API] googleLogin called");
    const result = await apiCall<{ app_session_id: string; user: any }>(
      "/api/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ idToken }),
      },
    );

    const sessionToken = result.app_session_id;
    console.log("[API] Google login result:", {
      hasSessionToken: !!sessionToken,
      hasUser: !!result.user,
    });

    return {
      sessionToken,
      user: result.user,
    };
  } catch (error) {
    console.error("[API] googleLogin failed:", error);
    throw error;
  }
}

// Microsoft OAuth login
export async function microsoftLogin(
  accessToken: string,
): Promise<{ sessionToken: string; user: any }> {
  try {
    console.log("[API] microsoftLogin called");
    const result = await apiCall<{ app_session_id: string; user: any }>(
      "/api/auth/microsoft",
      {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      },
    );

    const sessionToken = result.app_session_id;
    console.log("[API] Microsoft login result:", {
      hasSessionToken: !!sessionToken,
      hasUser: !!result.user,
    });

    return {
      sessionToken,
      user: result.user,
    };
  } catch (error) {
    console.error("[API] microsoftLogin failed:", error);
    throw error;
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  try {
    console.log("[API] requestPasswordReset called:", { email });
    const result = await apiCall<{ success: boolean }>("/api/auth/password-reset-request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    console.log("[API] Password reset request result:", result);
    return result;
  } catch (error) {
    console.error("[API] requestPasswordReset failed:", error);
    throw error;
  }
}

// Reset password with token
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  try {
    console.log("[API] resetPassword called");
    const result = await apiCall<{ success: boolean }>("/api/auth/password-reset", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });

    console.log("[API] Password reset result:", result);
    return result;
  } catch (error) {
    console.error("[API] resetPassword failed:", error);
    throw error;
  }
}
