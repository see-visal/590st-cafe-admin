import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth-api";
import type { VerifyLoginOtpPayload } from "@/features/auth/types/auth.type";

export function useVerifyLoginOtp() {
  return useMutation({
    mutationFn: ({
      persist,
      ...payload
    }: VerifyLoginOtpPayload & { persist?: boolean }) =>
      authService.verifyLoginOtp(payload, { persist }),
  });
}
