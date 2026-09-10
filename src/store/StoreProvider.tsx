"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { makeStore, type AppStore } from "./index";

/**
 * One store per browser session. Built in a ref rather than at module scope so that a server
 * render never shares a store between requests — each request gets its own.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }
  useEffect(() => setupListeners(storeRef.current!.dispatch), []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
