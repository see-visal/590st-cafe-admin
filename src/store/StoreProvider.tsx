"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { makeStore, type AppStore } from "./index";

/// A React component that provides the Redux store to its children. It creates a store instance on first render and reuses it for subsequent renders. It also sets up listeners for RTK Query's cache invalidation and refetching.
export function StoreProvider({ children }: { children: ReactNode }) {
  // Created once per mount; state rather than a lazily-filled ref, so render never reads `.current`.
  const [store] = useState<AppStore>(makeStore);
  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}>{children}</Provider>;
}
