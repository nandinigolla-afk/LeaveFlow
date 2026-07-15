import { api } from './api';
import type { ApiResponse, Department } from '@/types';

export const departmentsApi = {
  getAll: () => api.get<ApiResponse<Department[]>>('/departments').then((r) => r.data.data),
  create: (payload: { name: string; description?: string }) =>
    api.post<ApiResponse<Department>>('/departments', payload).then((r) => r.data.data),
  update: (id: number, payload: { name: string; description?: string }) =>
    api.put<ApiResponse<Department>>(`/departments/${id}`, payload).then((r) => r.data.data),
  remove: (id: number) => api.delete<ApiResponse<null>>(`/departments/${id}`).then((r) => r.data.message),
};
