import { LayoutDashboard, CalendarPlus, History, User, Bell } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/components/layout/Sidebar';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/employee', icon: LayoutDashboard },
  { label: 'Request Leave', to: '/employee/request', icon: CalendarPlus },
  { label: 'Leave History', to: '/employee/history', icon: History },
  { label: 'My Profile', to: '/profile', icon: User },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export function EmployeeLayout() {
  return <DashboardLayout navItems={navItems} />;
}
