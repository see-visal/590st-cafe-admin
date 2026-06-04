"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactNotification } from "@/features/notification/hooks/useContactNotifications";

interface NotificationAlertProps {
  notification: ContactNotification | null;
  onClose: () => void;
  autoHideDuration?: number;
}

function NotificationAlert({
  notification,
  onClose,
  autoHideDuration = 8000,
}: NotificationAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setProgress(100);

      if (autoHideDuration > 0) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - 100 / (autoHideDuration / 100);
            if (newProgress <= 0) {
              clearInterval(interval);
              return 0;
            }
            return newProgress;
          });
        }, 100);

        const timer = setTimeout(() => {
          handleClose();
        }, autoHideDuration);

        return () => {
          clearInterval(interval);
          clearTimeout(timer);
        };
      }
    }
  }, [notification, autoHideDuration, handleClose]);
  
  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 lg:top-4 right-4 left-4 sm:left-auto sm:right-8 lg:right-8 z-50 
        bg-white dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400
        shadow-xl dark:shadow-2xl rounded-lg overflow-hidden w-auto sm:max-w-md
        transition-all duration-300 transform
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
      `}
    >
      {/* Progress Bar */}
      <div
        className="h-1 bg-blue-500 dark:bg-blue-400 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                New Contact Message
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {notification.timestamp}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.name}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
              {notification.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {notification.subject}
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {notification.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              window.location.href = `mailto:${notification.email}?subject=Re: ${notification.subject}`;
            }}
          >
            Reply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotificationAlert;
