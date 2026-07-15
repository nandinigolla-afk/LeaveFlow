import { api } from './api';
import type { ApiResponse, Employee, EmployeeStatus, PageResponse } from '@/types';

export interface EmployeeSearchParams {
  search?: string;
  departmentId?: number;
  status?: EmployeeStatus;
  page?: number;
  size?: number;
}

export const employeesApi = {
  search: (params: EmployeeSearchParams) =>
    api.get<ApiResponse<PageResponse<Employee>>>('/employees', { params }).then((r) => r.data.data),

  getById: (id: number) => api.get<ApiResponse<Employee>>(`/employees/${id}`).then((r) => r.data.data),

  create: (payload: Record<string, unknown>) =>
    api.post<ApiResponse<Employee>>('/employees', payload).then((r) => r.data.data),

  update: (id: number, payload: Record<string, unknown>) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/employees/${id}`).then((r) => r.data.message),

  getMyProfile: () => api.get<ApiResponse<Employee>>('/profile').then((r) => r.data.data),

  updateMyProfile: (payload: { firstName: string; lastName: string; phone?: string; avatarUrl?: string }) =>
    api.put<ApiResponse<Employee>>('/profile', payload).then((r) => r.data.data),
};
