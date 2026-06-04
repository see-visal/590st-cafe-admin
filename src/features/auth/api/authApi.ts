import { apiClient } from "@/lib/apiClient";

export interface AuthUserInfo {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: AuthUserInfo;
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", {
      emailOrUsername: username,
      password,
    });
    apiClient.setAuthToken(response.accessToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
  },

  logout: (): void => {
    apiClient.setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  },
};

