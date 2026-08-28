"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * The admin UI is a light design. Defaulting to `dark` put `.dark` on <html>,
 * where `--popover-foreground` resolves to near-white against a white
 * `--popover` — every token-driven shadcn surface rendered white on white.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
