import { api } from './api';
import type { ApiResponse, LeaveSummaryReport } from '@/types';

export const reportsApi = {
  getLeaveSummary: (params: { fromDate?: string; toDate?: string; departmentId?: number }) =>
    api.get<ApiResponse<LeaveSummaryReport>>('/reports/leave-summary', { params }).then((r) => r.data.data),
};
