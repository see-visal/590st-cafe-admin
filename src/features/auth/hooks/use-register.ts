import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth-api";
import type { RegisterPayload } from "@/features/auth/types/auth.type";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
}
