"use client";

import React, { ReactNode, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/contexts/I18nContext";
import { FontProvider } from "./font-provider";
import type { Session } from "next-auth";

interface ClientProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export default function ClientProvider({
  children,
  session,
}: ClientProvidersProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={4 * 60}
      refetchOnWindowFocus={true}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <I18nProvider>
          <FontProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </FontProvider>
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
