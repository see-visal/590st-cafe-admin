"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { formatWithCommas } from "@/utils/numberFormat";
import type { FormatInput } from "@/types/FormInputType";


const timeUnitTranslations: Record<string, string> = {
  hour: "ម៉ោង",
  hours: "ម៉ោង",
  day: "ថ្ងៃ",
  days: "ថ្ងៃ",
  week: "សប្តាហ៍",
  weeks: "សប្តាហ៍",
  month: "ខែ",
  months: "ខែ",
};

// Define types for the translation messages structure
type TranslationMessages = {
  [key: string]: string | TranslationMessages;
};

type I18nContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  loadPage: (pageName: string) => Promise<void>;
  formatNumber: (num: number) => string;
  parseTimeAgo: (timeAgo: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Key for localStorage
const LOCALE_STORAGE_KEY = "selectedLocale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Initialize locale from localStorage or default to "en"
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      return savedLocale || "en";
    }
    return "en";
  });

  const [messages, setMessages] = useState<TranslationMessages>({});

  // Save locale to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  }, [locale]);

  // Function to get page name from pathname
  const getPageName = (path: string): string => {
    // Remove leading slash and get first segment
    const segments = path.replace(/^\//, "").split("/");
    const pageName = segments[0] || "dashboard"; // Default to dashboard for root

    const pageMap: Record<string, string> = {
      "": "dashboard",
      content: "content",
      moderation: "moderation",
      notifications: "notifications",
      settings: "settings",
      users: "users",
      badges: "badges",
    };

    return pageMap[pageName] || pageName;
  };

  // Function to load sidebar translations
  const loadSidebar = useCallback(async (): Promise<TranslationMessages> => {
    try {
      const res = await fetch(`/locales/${locale}/sidebar.json`);

      if (!res.ok) {
        // Fallback to English sidebar if current locale fails
        if (locale !== "en") {
          try {
            const enRes = await fetch(`/locales/en/sidebar.json`);
            if (enRes.ok) {
              return await enRes.json();
            }
          } catch {
            // Ignore fallback errors
          }
        }
        return {};
      }

      return await res.json();
    } catch {
      return {};
    }
  }, [locale]);

  // Function to load translations for a specific page
  const loadPage = useCallback(
    async (pageName: string) => {
      try {
        // Always load sidebar translations first
        const sidebarMessages = await loadSidebar();

        // Then load page-specific translations
        const res = await fetch(`/locales/${locale}/${pageName}.json`);

        if (!res.ok) {
          // Try to fallback to common.json if page-specific file doesn't exist
          if (pageName !== "common") {
            try {
              const fallbackRes = await fetch(`/locales/${locale}/common.json`);
              if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                // Merge sidebar + common translations
                setMessages({ ...sidebarMessages, ...fallbackData });
                return;
              }
            } catch {
              // Ignore fallback errors
            }
          }

          // Final fallback to English if selected locale fails
          if (locale !== "en") {
            try {
              const enRes = await fetch(`/locales/en/${pageName}.json`);
              if (enRes.ok) {
                const enData = await enRes.json();
                // Merge sidebar + English page translations
                setMessages({ ...sidebarMessages, ...enData });
                return;
              }
            } catch {
              // Ignore English fallback errors
            }
          }

          // If all else fails, use only sidebar translations
          setMessages(sidebarMessages);
          return;
        }

        const pageData: TranslationMessages = await res.json();
        // Always merge sidebar + page translations
        setMessages({ ...sidebarMessages, ...pageData });
      } catch {
        // If everything fails, try to load just sidebar
        try {
          const sidebarMessages = await loadSidebar();
          setMessages(sidebarMessages);
        } catch {
          // Keep existing messages if everything fails
        }
      }
    },
    [locale, loadSidebar]
  );

  // Load translations when pathname or locale changes
  useEffect(() => {
    const pageName = getPageName(pathname);
    loadPage(pageName);
  }, [pathname, locale, loadPage]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let result: string | TranslationMessages | undefined = messages;

    for (const k of keys) {
      if (typeof result === "object" && result !== null && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if path is invalid
      }
    }

    return typeof result === "string" ? result : key;
  };

  // Move formatNumber inside the provider where it can access locale
  const formatNumber = useCallback(
    (num: FormatInput): string => {
      // Format with commas first
      const formatted = formatWithCommas(num, "en-US");

      if (locale === "kh") {
        const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
        return formatted.replace(
          /\d/g,
          (digit) => khmerDigits[parseInt(digit)]
        );
      }

      return formatted;
    },
    [locale]
  );
  function parseTimeAgo(timeAgo: string) {
    const match = timeAgo.match(/(\d+)\s*(\w+)/);
    if (!match) return timeAgo;

    const [, numStr, unit] = match;
    const formattedNum = formatNumber(Number(numStr));
    const translatedUnit = timeUnitTranslations[unit.toLowerCase()] || unit;

    return `${formattedNum} ${translatedUnit}`;
  }

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, loadPage, formatNumber, parseTimeAgo }}
    >
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

// Hook for manually loading a specific page's translations
export function usePageTranslations(pageName?: string) {
  const { t, loadPage } = useI18n();

  useEffect(() => {
    if (pageName) {
      loadPage(pageName);
    }
  }, [pageName, loadPage]);

  return { t };
}
