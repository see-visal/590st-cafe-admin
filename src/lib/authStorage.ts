import type { AuthTokenResponse } from "@/store/api/types";

/**
 * Token persistence for the admin session.
 *
 * localStorage rather than cookies because the API is a separate origin and authenticates
 * with an `Authorization: Bearer` header, not a session cookie — so there is nothing for the
 * browser to attach automatically. Every accessor tolerates being called during SSR, where
 * `window` does not exist.
 */

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokenResponse): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // Private mode / storage disabled — the session simply will not survive a reload.
  }
}

export function clearTokens(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
