"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/auth-api";

/**
 * Clears the stored tokens, drops every cached query so the next account cannot
 * read the previous one's data, and returns to the login screen.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    authService.logout();
    queryClient.clear();
    router.replace("/login");
  };
}
