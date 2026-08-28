import { apiClient } from "@/lib/api/axios";
import type {
  AuthTokenResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  VerifyLoginOtpPayload,
  VerifyRegistrationPayload,
} from "@/features/auth/types/auth.type";

const AUTH_ENDPOINT = "/api/auth";

function persistTokens(tokens: AuthTokenResponse, persist: boolean) {
  apiClient.setAuthToken(tokens.accessToken, persist);
  if (typeof window !== "undefined") {
    const store = persist ? localStorage : sessionStorage;
    (persist ? sessionStorage : localStorage).removeItem("refreshToken");
    store.setItem("refreshToken", tokens.refreshToken);
  }
}

export const authService = {
  /**
   * Returns either an OTP challenge (`otpRequired: true` + `loginTicket`) or, for the
   * super-admin account, the tokens directly. Tokens are persisted when present.
   */
  login: async (
    payload: LoginPayload,
    { persist = true }: { persist?: boolean } = {}
  ): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      `${AUTH_ENDPOINT}/login`,
      payload
    );
    if (response.tokens) persistTokens(response.tokens, persist);
    return response;
  },

  verifyLoginOtp: async (
    payload: VerifyLoginOtpPayload,
    { persist = true }: { persist?: boolean } = {}
  ): Promise<AuthTokenResponse> => {
    const tokens = await apiClient.post<AuthTokenResponse>(
      `${AUTH_ENDPOINT}/verify-login-otp`,
      payload
    );
    persistTokens(tokens, persist);
    return tokens;
  },

  /** Creates the account and emails a 6-digit code; call verifyRegistration next. */
  register: (payload: RegisterPayload) =>
    apiClient.post<void>(`${AUTH_ENDPOINT}/register`, payload),

  verifyRegistration: (payload: VerifyRegistrationPayload) =>
    apiClient.post<void>(`${AUTH_ENDPOINT}/verify-registration`, payload),

  forgotPassword: (email: string) =>
    apiClient.post<void>(`${AUTH_ENDPOINT}/forgot-password`, { email }),

  logout: (): void => {
    apiClient.setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("refreshToken");
    }
  },
};
