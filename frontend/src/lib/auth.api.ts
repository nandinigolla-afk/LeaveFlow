import { api } from './api';
import type { ApiResponse, AuthResponse } from '@/types';

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
  dateOfJoining: string;
  departmentId?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/signup', payload).then((r) => r.data.data),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload).then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }).then((r) => r.data.message),

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword }).then((r) => r.data.message),
};
