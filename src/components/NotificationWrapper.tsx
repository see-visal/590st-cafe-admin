"use client";

import { useContactNotifications } from "@/hooks/useContactNotifications";
import React from "react";
import NotificationAlert from "./NotificationAlert";

function NotificationWrapper() {
  const { isConnected, notification, clearNotification } =
    useContactNotifications();

  return (
    <>
      {/* Global Notification */}
      <NotificationAlert
        notification={notification}
        onClose={clearNotification}
        autoHideDuration={10000}
      />

      {/* Connection Status (Optional - for debugging) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isConnected
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationWrapper;
