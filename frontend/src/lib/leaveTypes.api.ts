import { api } from './api';
import type { ApiResponse, LeaveType } from '@/types';

export const leaveTypesApi = {
  getAll: () => api.get<ApiResponse<LeaveType[]>>('/leave-types').then((r) => r.data.data),

  create: (payload: Partial<LeaveType>) =>
    api.post<ApiResponse<LeaveType>>('/leave-types', payload).then((r) => r.data.data),

  update: (id: number, payload: Partial<LeaveType>) =>
    api.put<ApiResponse<LeaveType>>(`/leave-types/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/leave-types/${id}`).then((r) => r.data.message),
};
