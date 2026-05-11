import apiClient from "./client";
import type { ApiResponse, PaginatedData, Notification, UnreadCount } from "../../types";
import { isDemoMode } from "../utils";
import { getMockNotificationsPaginated, MOCK_NOTIFICATIONS } from "../mock-data";

export const notificationsApi = {
  list: async (page = 1, limit = 20): Promise<PaginatedData<Notification>> => {
    if (isDemoMode()) return getMockNotificationsPaginated(page, limit);
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Notification>>>("/notifications", { params: { page, limit } });
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    if (isDemoMode()) return MOCK_NOTIFICATIONS.filter((n: Notification) => !n.isRead).length;
    const { data } = await apiClient.get<ApiResponse<UnreadCount>>("/notifications/unread-count");
    return data.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    if (isDemoMode()) return;
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    if (isDemoMode()) return;
    await apiClient.patch("/notifications/read-all");
  },
};
