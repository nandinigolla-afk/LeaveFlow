import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, type LoginPayload, type SignupPayload } from '@/lib/auth.api';
import { tokenStorage } from '@/lib/api';
import type { Role, UserSummary } from '@/types';

interface AuthContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'leaveflow_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const hasToken = tokenStorage.getAccessToken();
    if (stored && hasToken) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  function persistSession(authData: { accessToken: string; refreshToken: string; user: UserSummary }) {
    tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
    setUser(authData.user);
  }

  async function login(payload: LoginPayload) {
    const authData = await authApi.login(payload);
    persistSession(authData);
  }

  async function signup(payload: SignupPayload) {
    const authData = await authApi.signup(payload);
    persistSession(authData);
  }

  function logout() {
    tokenStorage.clear();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  function hasRole(role: Role) {
    return user?.roles.includes(role) ?? false;
  }

  function hasAnyRole(roles: Role[]) {
    return roles.some((r) => hasRole(r));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout, hasRole, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
