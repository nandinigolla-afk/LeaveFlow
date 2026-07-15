import { api } from './api';
import type { ApiResponse, NotificationItem, PageResponse } from '@/types';

export const notificationsApi = {
  getMine: (params: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<NotificationItem>>>('/notifications', { params }).then((r) => r.data.data),

  unreadCount: () => api.get<ApiResponse<number>>('/notifications/unread-count').then((r) => r.data.data),

  markAsRead: (id: number) => api.post<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => r.data.data),

  markAllAsRead: () => api.post<ApiResponse<null>>('/notifications/read-all').then((r) => r.data.data),
};
