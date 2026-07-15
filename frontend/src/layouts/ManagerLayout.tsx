import { LayoutDashboard, ListChecks, Users, FileBarChart, Bell, CalendarPlus } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import type { NavItem } from '@/components/layout/Sidebar';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/manager', icon: LayoutDashboard },
  { label: 'Team Approvals', to: '/manager/approvals', icon: ListChecks },
  { label: 'Team Members', to: '/manager/team', icon: Users },
  { label: 'My Leave', to: '/manager/my-leave', icon: CalendarPlus },
  { label: 'Reports', to: '/manager/reports', icon: FileBarChart },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export function ManagerLayout() {
  return <DashboardLayout navItems={navItems} />;
}
