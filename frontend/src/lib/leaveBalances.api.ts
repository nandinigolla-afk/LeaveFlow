import { api } from './api';
import type { ApiResponse, LeaveBalance } from '@/types';

export const leaveBalancesApi = {
  getMine: (year?: number) =>
    api.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me', { params: { year } }).then((r) => r.data.data),

  getForEmployee: (employeeId: number, year?: number) =>
    api.get<ApiResponse<LeaveBalance[]>>(`/leave-balances/employee/${employeeId}`, { params: { year } }).then((r) => r.data.data),
};
