export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** Milliseconds until the access token expires. */
  expiresIn: number;
  /** Same value, pre-formatted for display, e.g. "23 hours 59 minutes". */
  expiresInReadable: string;
}

/**
 * Most accounts get `otpRequired: true` and must call verify-login-otp with the
 * `loginTicket`. The super-admin account skips OTP and gets `tokens` straight away.
 */
export interface LoginResponse {
  otpRequired: boolean;
  loginTicket: string | null;
  tokens: AuthTokenResponse | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: Gender;
}

export interface VerifyRegistrationPayload {
  email: string;
  otp: string;
}

export interface VerifyLoginOtpPayload {
  loginTicket: string;
  otp: string;
}
