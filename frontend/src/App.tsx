import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ManagerLayout } from '@/layouts/ManagerLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';
import { SharedLayout } from '@/layouts/SharedLayout';

import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRedirect } from '@/routes/RoleRedirect';

import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminEmployeesPage from '@/pages/admin/EmployeesPage';
import AdminDepartmentsPage from '@/pages/admin/DepartmentsPage';
import AdminLeaveRequestsPage from '@/pages/admin/LeaveRequestsPage';
import AdminLeaveTypesPage from '@/pages/admin/LeaveTypesPage';
import AdminReportsPage from '@/pages/admin/ReportsPage';

import ManagerDashboardPage from '@/pages/manager/ManagerDashboardPage';
import TeamApprovalsPage from '@/pages/manager/TeamApprovalsPage';
import TeamMembersPage from '@/pages/manager/TeamMembersPage';
import ManagerMyLeavePage from '@/pages/manager/MyLeavePage';
import ManagerReportsPage from '@/pages/manager/ReportsPage';

import EmployeeDashboardPage from '@/pages/employee/EmployeeDashboardPage';
import RequestLeavePage from '@/pages/employee/RequestLeavePage';
import LeaveHistoryPage from '@/pages/employee/LeaveHistoryPage';

import ProfilePage from '@/pages/profile/ProfilePage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';

import UnauthorizedPage from '@/pages/misc/UnauthorizedPage';
import NotFoundPage from '@/pages/misc/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Post-login role dispatcher */}
      <Route element={<ProtectedRoute />}>
        <Route path="/redirect" element={<RoleRedirect />} />
        <Route element={<SharedLayout />}>
          <Route path="/profile" element={<ProfileRouteWrapper />} />
          <Route path="/notifications" element={<NotificationsRouteWrapper />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
          <Route path="/admin/leave-requests" element={<AdminLeaveRequestsPage />} />
          <Route path="/admin/leave-types" element={<AdminLeaveTypesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Manager */}
      <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
        <Route element={<ManagerLayout />}>
          <Route path="/manager" element={<ManagerDashboardPage />} />
          <Route path="/manager/approvals" element={<TeamApprovalsPage />} />
          <Route path="/manager/team" element={<TeamMembersPage />} />
          <Route path="/manager/my-leave" element={<ManagerMyLeavePage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
        </Route>
      </Route>

      {/* Employee */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeDashboardPage />} />
          <Route path="/employee/request" element={<RequestLeavePage />} />
          <Route path="/employee/history" element={<LeaveHistoryPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/redirect" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/**
 * Profile/Notifications are shared across roles but need a layout shell.
 * Phase 4 will route these through the correct role layout based on user.roles;
 * for now they render inside whichever layout matches the user's primary role.
 */
function ProfileRouteWrapper() {
  return <ProfilePage />;
}

function NotificationsRouteWrapper() {
  return <NotificationsPage />;
}
