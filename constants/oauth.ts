import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as ReactNative from "react-native";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "space.manus.sf.admin.quiz.t20260222082154";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
  // Google OAuth credentials
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  // Microsoft OAuth credentials
  microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? "",
};

export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL, deriving from current hostname if not set.
 * Metro runs on 8081, API server runs on 3000.
 * URL pattern: https://PORT-sandboxid.region.domain
 */
export function getApiBaseUrl(): string {
  // If API_BASE_URL is set, use it
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/$/, "");
  }

  // On web, derive from current hostname by replacing port 8081 with 3000
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    // Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
  }

  // Fallback to empty (will use relative URL)
  return "";
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

/**
 * Get the redirect URI for OAuth callback.
 * - Web: uses API server callback endpoint
 * - Native: uses deep link scheme
 */
export const getRedirectUri = () => {
  if (ReactNative.Platform.OS === "web") {
    return `${getApiBaseUrl()}/api/oauth/callback`;
  } else {
    return Linking.createURL("/oauth/callback", {
      scheme: env.deepLinkScheme,
    });
  }
};

/**
 * Generate a random state parameter for OAuth security
 */
const generateState = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let state = "";
  for (let i = 0; i < 32; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return state;
};

/**
 * Get Google OAuth login URL
 */
export const getGoogleLoginUrl = (): string => {
  const redirectUri = getRedirectUri();
  const state = generateState();
  
  // Store state in sessionStorage for verification
  if (typeof window !== "undefined" && window.sessionStorage) {
    window.sessionStorage.setItem("oauth_state", state);
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);

  return url.toString();
};

/**
 * Get Microsoft OAuth login URL
 */
export const getMicrosoftLoginUrl = (): string => {
  const redirectUri = getRedirectUri();
  const state = generateState();
  
  // Store state in sessionStorage for verification
  if (typeof window !== "undefined" && window.sessionStorage) {
    window.sessionStorage.setItem("oauth_state", state);
  }

  const url = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  url.searchParams.set("client_id", env.microsoftClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);

  return url.toString();
};

/**
 * Start OAuth login flow.
 *
 * On native platforms (iOS/Android), open the system browser directly so
 * the OAuth callback returns via deep link to the app.
 *
 * On web, open the login URL in the system browser using expo-web-browser.
 */
export async function startOAuthLogin(provider: "google" | "microsoft"): Promise<void> {
  const loginUrl = provider === "google" ? getGoogleLoginUrl() : getMicrosoftLoginUrl();

  if (ReactNative.Platform.OS === "web") {
    // On web, open in system browser using expo-web-browser
    try {
      const result = await WebBrowser.openBrowserAsync(loginUrl);
      console.log("[OAuth] Browser result:", result);
    } catch (error) {
      console.error("[OAuth] Failed to open browser:", error);
      throw error;
    }
    return;
  }

  // On native, use Linking to open the URL
  const supported = await Linking.canOpenURL(loginUrl);
  if (!supported) {
    console.warn("[OAuth] Cannot open login URL: URL scheme not supported");
    throw new Error("ログインURLを開くことができません");
  }

  try {
    await Linking.openURL(loginUrl);
  } catch (error) {
    console.error("[OAuth] Failed to open login URL:", error);
    throw error;
  }
}
