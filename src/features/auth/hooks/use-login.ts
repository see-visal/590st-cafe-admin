import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth-api";
import type { LoginPayload } from "@/features/auth/types/auth.type";

export function useLogin() {
  return useMutation({
    mutationFn: ({
      persist,
      ...payload
    }: LoginPayload & { persist?: boolean }) =>
      authService.login(payload, { persist }),
  });
}
