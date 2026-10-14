"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { formatWithCommas } from "@/utils/format-currency";
import {
  interpolate,
  lookup,
  setActiveMessages,
  type TranslationMessages,
  type TranslationParams,
} from "./translate";

export { translate, type TranslationParams } from "./translate";

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

// Shared dictionaries, merged at the root of the messages (e.g. "nav_home", "actions.save").
const ROOT_TRANSLATION_FILES = ["common", "sidebar"] as const;

// One dictionary per page, nested under its own name (e.g. "orders.title" lives in orders.json).
// All of them load with the locale, so switching pages never shows untranslated text.
const PAGE_TRANSLATION_FILES = new Set<string>([
  "attendance",
  "audit",
  "auth",
  "banners",
  "barista",
  "categories",
  "dashboard",
  "events",
  "inventory",
  "notifications",
  "orders",
  "payments",
  "points",
  "pos",
  "products",
  "profile",
  "promotions",
  "reports",
  "settings",
  "staff",
  "stock_alerts",
  "tables",
  "users",
]);

type I18nContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string, params?: TranslationParams) => string;
  loadPage: (pageName: string) => Promise<void>;
  formatNumber: (num: number) => string;
  parseTimeAgo: (timeAgo: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "selectedLocale";

const fileCache = new Map<string, Promise<TranslationMessages>>();

function loadFile(locale: string, file: string): Promise<TranslationMessages> {
  const cacheKey = `${locale}/${file}`;
  const cached = fileCache.get(cacheKey);
  if (cached) return cached;

  const pending = (async (): Promise<TranslationMessages> => {
    try {
      const res = await fetch(`/locales/${locale}/${file}.json`);
      if (res.ok) return await res.json();
    } catch {
    }
    // Let a later locale switch try again instead of caching the failure.
    fileCache.delete(cacheKey);
    return locale !== "en" ? loadFile("en", file) : {};
  })();
  fileCache.set(cacheKey, pending);
  return pending;
}

async function loadMessages(locale: string): Promise<TranslationMessages> {
  const [roots, pages] = await Promise.all([
    Promise.all(ROOT_TRANSLATION_FILES.map((file) => loadFile(locale, file))),
    Promise.all(
      [...PAGE_TRANSLATION_FILES].map(
        async (file) => [file, await loadFile(locale, file)] as const
      )
    ),
  ]);
  return Object.assign({}, ...roots, Object.fromEntries(pages));
}

export function I18nProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    let cancelled = false;
    void loadMessages(locale).then((next) => {
      // A newer locale switch owns the messages now.
      if (cancelled) return;
      setActiveMessages(next);
      setMessages(next);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Every page dictionary already loads with the locale; this keeps the old per-page API working.
  const loadPage = useCallback(
    async (pageName: string) => {
      if (!pageName || PAGE_TRANSLATION_FILES.has(pageName)) return;
      const pageData = await loadFile(locale, pageName);
      setMessages((prev) => {
        const next = { ...prev, [pageName]: pageData };
        setActiveMessages(next);
        return next;
      });
    },
    [locale]
  );

  const t = useCallback(
    (key: string, fallback?: string, params?: TranslationParams): string =>
      interpolate(lookup(messages, key) ?? fallback ?? key, params),
    [messages]
  );

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
  const parseTimeAgo = useCallback(
    (timeAgo: string) => {
      const match = timeAgo.match(/(\d+)\s*(\w+)/);
      if (!match) return timeAgo;

      const [, numStr, unit] = match;
      const formattedNum = formatNumber(Number(numStr));
      const translatedUnit = timeUnitTranslations[unit.toLowerCase()] || unit;

      return `${formattedNum} ${translatedUnit}`;
    },
    [formatNumber]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, loadPage, formatNumber, parseTimeAgo }),
    [locale, t, loadPage, formatNumber, parseTimeAgo]
  );

  return (
    <I18nContext.Provider value={value}>
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
