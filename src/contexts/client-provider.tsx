"use client";

import React, { ReactNode, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/contexts/I18nContext";
import { StoreProvider } from "@/store/StoreProvider";
import { FontProvider } from "./font-provider";

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * StoreProvider is outermost so every other provider — and every screen — can reach the RTK
 * Query cache. It replaces next-auth's SessionProvider: the admin authenticates against the
 * Spring API with a JWT it holds itself, and there was never a NextAuth route to back a
 * session.
 */
export default function ClientProvider({ children }: ClientProvidersProps) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <I18nProvider>
          <FontProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            {/* Every mutation reports success/failure through react-hot-toast. */}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </FontProvider>
        </I18nProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
