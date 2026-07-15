import { LayoutDashboard, Users, Building2, ListChecks, FileBarChart, Settings, Bell, CalendarPlus, History, User } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/components/layout/Sidebar';

const navByRole: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Employees', to: '/admin/employees', icon: Users },
    { label: 'Departments', to: '/admin/departments', icon: Building2 },
    { label: 'Leave Requests', to: '/admin/leave-requests', icon: ListChecks },
    { label: 'Leave Types', to: '/admin/leave-types', icon: Settings },
    { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  MANAGER: [
    { label: 'Dashboard', to: '/manager', icon: LayoutDashboard },
    { label: 'Team Approvals', to: '/manager/approvals', icon: ListChecks },
    { label: 'Team Members', to: '/manager/team', icon: Users },
    { label: 'My Leave', to: '/manager/my-leave', icon: CalendarPlus },
    { label: 'Reports', to: '/manager/reports', icon: FileBarChart },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', to: '/employee', icon: LayoutDashboard },
    { label: 'Request Leave', to: '/employee/request', icon: CalendarPlus },
    { label: 'Leave History', to: '/employee/history', icon: History },
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
};

/** Used for cross-role shared pages (profile, notifications) so the sidebar still matches the user's primary role. */
export function SharedLayout() {
  const { user } = useAuth();
  const primaryRole = user?.roles.includes('ADMIN') ? 'ADMIN' : user?.roles.includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE';
  return <DashboardLayout navItems={navByRole[primaryRole]} />;
}
