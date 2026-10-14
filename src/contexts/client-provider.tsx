"use client";

import React, { ReactNode, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AppToast } from "@/components/common/AppToast";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";
import { StoreProvider } from "@/store/StoreProvider";
import { FontProvider } from "./font-provider";
import { useOpenNativePickers } from "@/hooks/useOpenNativePickers";

function LoadingFallback() {
  const { t } = useI18n();
  return <div>{t("states.loading", "Loading...")}</div>;
}

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProvidersProps) {
  useOpenNativePickers();
  return (
    <StoreProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <I18nProvider>
          <FontProvider>
            <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            <Toaster
              position="top-right"
              gutter={10}
              containerClassName="admin_toaster"
              toastOptions={{ duration: 4000, error: { duration: 6000 } }}
            >
              {(t) => <AppToast t={t} />}
            </Toaster>
          </FontProvider>
        </I18nProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
