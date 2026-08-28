export interface Notification {
  id: number;
  userId: number;
  type: string;
  channel: string;
  title: string;
  message: string;
  actionUrl?: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
