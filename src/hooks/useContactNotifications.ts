import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface ContactNotification {
  type: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

export const useContactNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState<ContactNotification | null>(
    null
  );
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    let isComponentMounted = true;

    const connect = () => {
      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const stompClient = new Client({
        webSocketFactory: () => {
          if (!wsUrl) {
            throw new Error("WebSocket URL is not defined. Please set NEXT_PUBLIC_WS_URL in your environment variables.");
          }
          return new SockJS(wsUrl);
        },

        onConnect: () => {
          if (!isComponentMounted) return;

          console.log("✅ WebSocket Connected Successfully!");
          setIsConnected(true);

          // Subscribe to notifications
          stompClient.subscribe("/topic/notifications", (message: IMessage) => {
            console.log("📨 Message received:", message.body);
            try {
              const data: ContactNotification = JSON.parse(message.body);
              console.log("📧 Notification:", data);
              setNotification(data);
              playNotificationSound();
            } catch (error) {
              console.error("❌ Parse error:", error);
            }
          });
        },

        onStompError: (frame) => {
          console.error("❌ STOMP Error:", frame.headers["message"]);
          console.error("Frame body:", frame.body);
          if (isComponentMounted) {
            setIsConnected(false);
          }
        },

        onWebSocketError: (event) => {
          console.error("❌ WebSocket Error:", event);
          if (isComponentMounted) {
            setIsConnected(false);
          }
        },

        onWebSocketClose: (event) => {
          console.log(`🔌 WebSocket Closed (Code: ${event.code})`);
          if (isComponentMounted) {
            setIsConnected(false);
            // Reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("🔄 Reconnecting...");
              connect();
            }, 5000);
          }
        },

        onDisconnect: () => {
          console.log("🔌 Disconnected");
          if (isComponentMounted) {
            setIsConnected(false);
          }
        },

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 5000,

        debug: (str) => {
          console.log("🐛 STOMP:", str);
        },
      });

      try {
        stompClient.activate();
        stompClientRef.current = stompClient;
        console.log("🚀 STOMP Client Activated");
      } catch (error) {
        console.error("❌ Activation Error:", error);
        if (isComponentMounted) {
          setIsConnected(false);
        }
      }
    };

    if (wsUrl) {
      connect();
    } else {
      console.warn("WebSocket URL not provided; skipping connection until NEXT_PUBLIC_WS_URL is set.");
    }

    return () => {
      isComponentMounted = false;
      console.log("🛑 Cleaning up WebSocket...");

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [wsUrl]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error("🔇 Sound error:", e);
    }
  };

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return { isConnected, notification, clearNotification };
};
