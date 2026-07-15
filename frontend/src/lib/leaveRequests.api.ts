import { api } from './api';
import type { ApiResponse, AuditLog, LeaveRequest, LeaveStatus, PageResponse } from '@/types';

export interface LeaveRequestSearchParams {
  status?: LeaveStatus;
  leaveTypeId?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  employeeId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const leaveRequestsApi = {
  create: (payload: { leaveTypeId: number; startDate: string; endDate: string; reason?: string }) =>
    api.post<ApiResponse<LeaveRequest>>('/leave-requests', payload).then((r) => r.data.data),

  update: (id: number, payload: { leaveTypeId: number; startDate: string; endDate: string; reason?: string }) =>
    api.put<ApiResponse<LeaveRequest>>(`/leave-requests/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/leave-requests/${id}`).then((r) => r.data.message),

  cancel: (id: number) =>
    api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/cancel`).then((r) => r.data.data),

  review: (id: number, approve: boolean, comment?: string) =>
    api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/review`, { approve, comment }).then((r) => r.data.data),

  getById: (id: number) => api.get<ApiResponse<LeaveRequest>>(`/leave-requests/${id}`).then((r) => r.data.data),

  getAuditTrail: (id: number) =>
    api.get<ApiResponse<AuditLog[]>>(`/leave-requests/${id}/audit-trail`).then((r) => r.data.data),

  getMine: (params: LeaveRequestSearchParams) =>
    api.get<ApiResponse<PageResponse<LeaveRequest>>>('/leave-requests/me', { params }).then((r) => r.data.data),

  searchAll: (params: LeaveRequestSearchParams) =>
    api.get<ApiResponse<PageResponse<LeaveRequest>>>('/leave-requests', { params }).then((r) => r.data.data),

  getPendingApprovals: (params: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<LeaveRequest>>>('/leave-requests/pending-approvals', { params }).then((r) => r.data.data),
};
