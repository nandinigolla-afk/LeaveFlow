import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

/** Sends an authenticated user to their role's home dashboard. */
export function RoleRedirect() {
  const { user } = useAuth();

  if (user?.roles.includes('ADMIN')) return <Navigate to="/admin" replace />;
  if (user?.roles.includes('MANAGER')) return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
}
