import { LayoutDashboard, Users, Building2, ListChecks, FileBarChart, Settings, Bell } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/components/layout/Sidebar';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Employees', to: '/admin/employees', icon: Users },
  { label: 'Departments', to: '/admin/departments', icon: Building2 },
  { label: 'Leave Requests', to: '/admin/leave-requests', icon: ListChecks },
  { label: 'Leave Types', to: '/admin/leave-types', icon: Settings },
  { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export function AdminLayout() {
  return <DashboardLayout navItems={navItems} />;
}
