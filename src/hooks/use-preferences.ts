"use client";

import { useEffect, useState } from "react";

export const PREFERENCES_KEY = "admin-preferences";
/** Fired after a save so open screens pick up the change without a reload. */
export const PREFERENCES_EVENT = "admin-preferences-change";

export interface Preferences {
  currency: "KHR" | "USD";
  soundAlerts: boolean;
  /** Seconds between order-queue refetches. */
  autoRefreshInterval: string;
}

export const PREFERENCE_DEFAULTS: Preferences = {
  currency: "KHR",
  soundAlerts: true,
  autoRefreshInterval: "10",
};

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return PREFERENCE_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    return raw
      ? { ...PREFERENCE_DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) }
      : PREFERENCE_DEFAULTS;
  } catch {
    return PREFERENCE_DEFAULTS;
  }
}

export function writePreferences(next: Preferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

/**
 * Reads the saved preferences and re-renders when they change — either from the
 * settings screen in this tab, or from another tab via the `storage` event.
 */
export function usePreferences(): Preferences {
  const [prefs, setPrefs] = useState<Preferences>(PREFERENCE_DEFAULTS);

  useEffect(() => {
    const sync = () => setPrefs(readPreferences());
    sync();
    window.addEventListener(PREFERENCES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return prefs;
}
