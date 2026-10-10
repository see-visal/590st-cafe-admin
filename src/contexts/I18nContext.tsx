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
import { formatWithCommas } from "@/utils/format-currency";
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

const PAGE_TRANSLATION_FILES = new Set<string>([]);

type TranslationMessages = {
  [key: string]: string | TranslationMessages;
};

type I18nContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  loadPage: (pageName: string) => Promise<void>;
  formatNumber: (num: number) => string;
  parseTimeAgo: (timeAgo: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "selectedLocale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      return savedLocale || "en";
    }
    return "en";
  });

  const [messages, setMessages] = useState<TranslationMessages>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  }, [locale]);

  const getPageName = (path: string): string => {
    const segments = path.replace(/^\//, "").split("/");
    const pageName = segments[0] || "dashboard";

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

  // Shared strings loaded on every page: sidebar labels plus common UI (map picker, venue, etc.).
  const loadSidebar = useCallback(async (): Promise<TranslationMessages> => {
    const loadFile = async (file: string): Promise<TranslationMessages> => {
      try {
        const res = await fetch(`/locales/${locale}/${file}.json`);
        if (res.ok) return await res.json();
        if (locale !== "en") {
          const enRes = await fetch(`/locales/en/${file}.json`);
          if (enRes.ok) return await enRes.json();
        }
      } catch {
      }
      return {};
    };

    const [sidebar, common] = await Promise.all([loadFile("sidebar"), loadFile("common")]);
    return { ...common, ...sidebar };
  }, [locale]);

  const loadPage = useCallback(
    async (pageName: string) => {
      try {
        const sidebarMessages = await loadSidebar();

        if (!PAGE_TRANSLATION_FILES.has(pageName)) {
          setMessages(sidebarMessages);
          return;
        }

        const res = await fetch(`/locales/${locale}/${pageName}.json`);

        if (!res.ok) {
          if (pageName !== "common") {
            try {
              const fallbackRes = await fetch(`/locales/${locale}/common.json`);
              if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                setMessages({ ...sidebarMessages, ...fallbackData });
                return;
              }
            } catch {
            }
          }

          if (locale !== "en") {
            try {
              const enRes = await fetch(`/locales/en/${pageName}.json`);
              if (enRes.ok) {
                const enData = await enRes.json();
                setMessages({ ...sidebarMessages, ...enData });
                return;
              }
            } catch {
            }
          }

          setMessages(sidebarMessages);
          return;
        }

        const pageData: TranslationMessages = await res.json();
        setMessages({ ...sidebarMessages, ...pageData });
      } catch {
        try {
          const sidebarMessages = await loadSidebar();
          setMessages(sidebarMessages);
        } catch {
        }
      }
    },
    [locale, loadSidebar]
  );

  useEffect(() => {
    const pageName = getPageName(pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(pageName);
  }, [pathname, locale, loadPage]);

  const t = (key: string, fallback?: string): string => {
    const keys = key.split(".");
    let result: string | TranslationMessages | undefined = messages;

    for (const k of keys) {
      if (typeof result === "object" && result !== null && k in result) {
        result = result[k];
      } else {
        return fallback ?? key;
      }
    }

    return typeof result === "string" ? result : fallback ?? key;
  };

  const formatNumber = useCallback(
    (num: Parameters<typeof formatWithCommas>[0]): string => {
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

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export function usePageTranslations(pageName?: string) {
  const { t, loadPage } = useI18n();

  useEffect(() => {
    if (pageName) {
      loadPage(pageName);
    }
  }, [pageName, loadPage]);

  return { t };
}







