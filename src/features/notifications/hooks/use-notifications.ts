import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/features/notifications/api/notification-api";
import { notificationQueryKeys } from "@/features/notifications/constants/notification-query-keys";

export function useNotifications() {
  const query = useQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: async () => {
      const [notifications, unreadCount] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      return { notifications, unreadCount };
    },
    refetchInterval: 10_000,
  });
  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
  return { markRead: mutation.mutateAsync, isLoading: mutation.isPending };
}
