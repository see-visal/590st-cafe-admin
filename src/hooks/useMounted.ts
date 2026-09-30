"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False on the server and during hydration, true afterwards — without a setState in an effect. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
