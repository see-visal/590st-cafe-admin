import { apiClient } from "@/lib/api/axios";
import type { Notification } from "@/features/notifications/types/notification.type";

const NOTIFICATION_ENDPOINT = "/api/v1/notifications";

export const notificationApi = {
  getAll: () => apiClient.get<Notification[]>(NOTIFICATION_ENDPOINT),
  getUnread: () => apiClient.get<Notification[]>(`${NOTIFICATION_ENDPOINT}/unread`),
  getUnreadCount: () => apiClient.get<number>(`${NOTIFICATION_ENDPOINT}/unread/count`),
  markRead: (id: number) => apiClient.post(`${NOTIFICATION_ENDPOINT}/${id}/read`, {}),
  markAllRead: () => apiClient.post(`${NOTIFICATION_ENDPOINT}/read-all`, {}),
};
