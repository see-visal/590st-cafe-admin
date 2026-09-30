"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// A saved preference in localStorage, read through useSyncExternalStore: the server and the
// hydrating render use `fallback`, then the saved value takes over without an extra effect
// pass. Every hook on the same key (and other tabs, via `storage`) stays in sync.

const listeners = new Map<string, Set<() => void>>();

function subscribeTo(key: string) {
  return (onChange: () => void) => {
    const set = listeners.get(key) ?? new Set();
    set.add(onChange);
    listeners.set(key, set);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      set.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * `parse` turns the stored string (or null) into a valid value, so a stale or tampered entry
 * falls back instead of leaking through; `serialize` is its inverse (defaults to String).
 */
export function useLocalStorageState<T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string = String,
): [T, (value: T) => void] {
  const subscribe = useMemo(() => subscribeTo(key), [key]);
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = parse(raw);
  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch {
        // Private mode or a full quota — nothing to persist to; the choice is lost on reload.
      }
      listeners.get(key)?.forEach((notify) => notify());
    },
    [key, serialize],
  );
  return [value, setValue];
}
