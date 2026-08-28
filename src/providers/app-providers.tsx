"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { FontProvider } from "@/providers/font-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <FontProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </FontProvider>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
