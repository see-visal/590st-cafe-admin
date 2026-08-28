import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth-api";
import type { VerifyRegistrationPayload } from "@/features/auth/types/auth.type";

export function useVerifyRegistration() {
  return useMutation({
    mutationFn: (payload: VerifyRegistrationPayload) =>
      authService.verifyRegistration(payload),
  });
}
