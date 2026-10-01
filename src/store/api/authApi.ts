import { clearTokens, setTokens } from "@/lib/authStorage";
import { markWelcomePending } from "@/lib/welcomeToast";
import { baseApi, unwrap } from "./baseApi";
import type {
  ApiEnvelope,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  PhoneLoginRequest,
  TelegramWidgetAuthRequest,
  UpdateProfileRequest,
  UserResponse,
  VerifyLoginOtpRequest,
} from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponse,
      LoginRequest & { remember?: boolean }
    >({
      query: ({ email, password }) => ({
        url: "/api/auth/login",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (response: ApiEnvelope<LoginResponse>, _meta, arg) => {
        const result = unwrap(response);
        if (result.tokens) {
          setTokens(result.tokens, arg.remember ?? true);
          markWelcomePending();
        }
        return result;
      },
      invalidatesTags: ["Auth"],
    }),

    loginPhone: builder.mutation<LoginResponse, PhoneLoginRequest>({
      query: (body) => ({
        url: "/api/auth/login/phone",
        method: "POST",
        body,
      }),
      transformResponse: unwrap<LoginResponse>,
    }),

    verifyLoginOtp: builder.mutation<
      AuthTokenResponse,
      VerifyLoginOtpRequest & { remember?: boolean }
    >({
      query: ({ loginTicket, otp }) => ({
        url: "/api/auth/verify-login-otp",
        method: "POST",
        body: { loginTicket, otp },
      }),
      transformResponse: (
        response: ApiEnvelope<AuthTokenResponse>,
        _meta,
        arg,
      ) => {
        const tokens = unwrap(response);
        setTokens(tokens, arg.remember ?? true);
        markWelcomePending();
        return tokens;
      },
      invalidatesTags: ["Auth"],
    }),

    loginTelegram: builder.mutation<
      AuthTokenResponse,
      TelegramWidgetAuthRequest & { remember?: boolean }
    >({
      query: ({ remember: _remember, ...body }) => ({
        url: "/api/auth/login/telegram",
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiEnvelope<AuthTokenResponse>,
        _meta,
        arg,
      ) => {
        const tokens = unwrap(response);
        setTokens(tokens, arg.remember ?? true);
        markWelcomePending();
        return tokens;
      },
      invalidatesTags: ["Auth"],
    }),

    resendOtp: builder.mutation<
      void,
      { purpose: "LOGIN"; loginTicket: string }
    >({
      query: (body) => ({ url: "/api/auth/resend-otp", method: "POST", body }),
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      void,
      { email: string; otp: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          clearTokens();
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    getCurrentUser: builder.query<UserResponse, void>({
      query: () => "/api/users/me",
      transformResponse: unwrap<UserResponse>,
      providesTags: ["Auth"],
    }),

    updateProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (body) => ({ url: "/api/users/me", method: "PATCH", body }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (result) => [
        "Auth",
        { type: "User" as const, id: "LIST" },
        ...(result ? [{ type: "User" as const, id: result.id }] : []),
        { type: "Admin" as const, id: "LIST" },
        { type: "Barista" as const, id: "LIST" },
      ],
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: "/api/users/me/change-password",
        method: "POST",
        body,
      }),
    }),

    uploadAvatar: builder.mutation<UserResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/api/users/me/avatar", method: "POST", body: formData };
      },
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (result) => [
        "Auth",
        { type: "User", id: "LIST" },
        ...(result ? [{ type: "User" as const, id: result.id }] : []),
        { type: "Admin", id: "LIST" },
        { type: "Barista", id: "LIST" },
      ],
    }),

    removeAvatar: builder.mutation<UserResponse, void>({
      query: () => ({ url: "/api/users/me/avatar", method: "DELETE" }),
      transformResponse: unwrap<UserResponse>,
      invalidatesTags: (result) => [
        "Auth",
        { type: "User", id: "LIST" },
        ...(result ? [{ type: "User" as const, id: result.id }] : []),
        { type: "Admin", id: "LIST" },
        { type: "Barista", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useResendOtpMutation,
  useLoginTelegramMutation,
  useLoginPhoneMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} = authApi;
