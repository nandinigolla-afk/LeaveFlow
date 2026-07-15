export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserSummary {
  userId: number;
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  designation: string;
  departmentName: string | null;
  avatarUrl: string | null;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserSummary;
}

export interface Department {
  id: number;
  name: string;
  description: string | null;
  employeeCount: number;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  designation: string;
  departmentId: number | null;
  departmentName: string | null;
  managerId: number | null;
  managerName: string | null;
  dateOfJoining: string;
  status: EmployeeStatus;
  avatarUrl: string | null;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  defaultAnnualDays: number;
  requiresApproval: boolean;
  active: boolean;
  colorHex: string;
}

export interface LeaveBalance {
  id: number;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeCode: string;
  colorHex: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  carriedForward: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  employeeAvatarUrl: string | null;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: LeaveStatus;
  reviewedById: number | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  action: string;
  performedByName: string;
  previousStatus: LeaveStatus | null;
  newStatus: LeaveStatus | null;
  notes: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface LeaveSummaryReport {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  byDepartment: { departmentName: string; totalRequests: number; totalDaysTaken: number }[];
  byLeaveType: { leaveTypeName: string; totalRequests: number; totalDaysTaken: number }[];
}
