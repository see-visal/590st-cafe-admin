"use client";

import { Bell, ChevronDown } from "lucide-react";

interface TopActionsProps {
  notificationCount?: number;
  languageLabel?: string;
}

export function TopActions({
  notificationCount = 10,
  languageLabel = "Kh",
}: TopActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
          {notificationCount}
        </span>
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
        aria-label="Language"
      >
        <span>{languageLabel}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
