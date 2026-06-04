/**
 * Comprehensive React Hooks for Admin Dashboard
 * Handles all CRUD operations with error handling and notifications
 */

import { useState, useCallback, useEffect } from "react";
import {
  adminService,
  Order,
  KitchenOrder,
  Inventory,
  Customer,
  Staff,
  Report,
  DashboardSummary,
  Notification,
} from "@/lib/services/adminService";
import { ApiError } from "@/lib/services/apiClient";
import toast from "react-hot-toast";

// ==================== ORDERS HOOKS ====================

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.orders.getAll();
      setOrders(data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to fetch orders");
      setError(apiError);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { orders, isLoading, error, refetch: fetch };
}

export function useUpdateOrderStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const update = useCallback(async (orderId: number, status: string) => {
    setIsLoading(true);
    try {
      const result = await adminService.orders.updateStatus(orderId, status);
      toast.success("Order status updated");
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to update order");
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading };
}

export function useCancelOrder() {
  const [isLoading, setIsLoading] = useState(false);

  const cancel = useCallback(async (orderId: number) => {
    setIsLoading(true);
    try {
      await adminService.orders.cancel(orderId);
      toast.success("Order cancelled");
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to cancel order");
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { cancel, isLoading };
}

// ==================== KITCHEN QUEUE HOOKS ====================

export function useKitchenQueue() {
  const [queue, setQueue] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.kitchen.getActiveOrders();
      setQueue(data);
    } catch {
      toast.error("Failed to fetch kitchen queue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetch]);

  return { queue, isLoading, refetch: fetch };
}

export function useUpdateKitchenQueue() {
  const [isLoading, setIsLoading] = useState(false);

  const accept = useCallback(async (queueId: number) => {
    setIsLoading(true);
    try {
      await adminService.kitchen.accept(queueId);
      toast.success("Order accepted");
    } catch (err) {
      toast.error("Failed to accept order");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markPreparing = useCallback(async (queueId: number) => {
    setIsLoading(true);
    try {
      await adminService.kitchen.markPreparing(queueId);
      toast.success("Marked as preparing");
    } catch (err) {
      toast.error("Failed to update status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markReady = useCallback(async (queueId: number) => {
    setIsLoading(true);
    try {
      await adminService.kitchen.markReady(queueId);
      toast.success("Order ready!");
    } catch (err) {
      toast.error("Failed to mark as ready");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { accept, markPreparing, markReady, isLoading };
}

// ==================== INVENTORY HOOKS ====================

export function useInventory() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.inventory.getAll();
      setInventory(data);
    } catch {
      toast.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { inventory, isLoading, refetch: fetch };
}

export function useAdjustInventory() {
  const [isLoading, setIsLoading] = useState(false);

  const adjust = useCallback(async (inventoryId: number, quantity: number) => {
    setIsLoading(true);
    try {
      await adminService.inventory.adjust(inventoryId, quantity);
      toast.success("Inventory adjusted");
    } catch (err) {
      toast.error("Failed to adjust inventory");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { adjust, isLoading };
}

// ==================== CUSTOMERS HOOKS ====================

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.customers.getAll();
      setCustomers(data);
    } catch {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { customers, isLoading, refetch: fetch };
}

// ==================== STAFF HOOKS ====================

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.staff.getAll();
      setStaff(data);
    } catch {
      toast.error("Failed to fetch staff");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { staff, isLoading, refetch: fetch };
}

export function useCreateStaff() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (data: import("@/lib/services/adminService").StaffCreatePayload) => {
    setIsLoading(true);
    try {
      const result = await adminService.staff.create(data);
      toast.success("Staff member added");
      return result;
    } catch (err) {
      toast.error("Failed to add staff member");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading };
}

// ==================== REPORTS HOOKS ====================

export function useSalesReport(startDate: string, endDate: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    try {
      const data = await adminService.reports.sales(startDate, endDate);
      setReport(data);
    } catch {
      toast.error("Failed to fetch sales report");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { report, isLoading, refetch: fetch };
}

export function useInventoryReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.reports.inventory();
      setReport(data);
    } catch {
      toast.error("Failed to fetch inventory report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { report, isLoading, refetch: fetch };
}

// ==================== DASHBOARD HOOKS ====================

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.dashboard.getSummary();
      setSummary(data);
    } catch {
      console.error("Failed to fetch dashboard summary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetch]);

  return { summary, isLoading, refetch: fetch };
}

// ==================== NOTIFICATIONS HOOKS ====================

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.notifications.getAll();
      const count = await adminService.notifications.getUnreadCount();
      setNotifications(data);
      setUnreadCount(count);
    } catch {
      console.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetch]);

  return { notifications, unreadCount, isLoading, refetch: fetch };
}

export function useMarkNotificationRead() {
  const [isLoading, setIsLoading] = useState(false);

  const markRead = useCallback(async (notificationId: number) => {
    setIsLoading(true);
    try {
      await adminService.notifications.markRead(notificationId);
    } catch {
      console.error("Failed to mark notification as read");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { markRead, isLoading };
}
