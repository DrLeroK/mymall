'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Role, StaffRole } from '@/types';
import { ApiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  role: Role;
  staffRole?: StaffRole | null;
  storeId?: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: Role;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRolePreview: (role: Role, staffRole?: StaffRole) => void;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  chooseRole: (targetRole: 'STORE_OWNER' | 'CUSTOMER') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = ApiClient.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await ApiClient.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('mymall_user', JSON.stringify(res.user));
      } else {
        ApiClient.clearTokens();
        setUser(null);
      }
    } catch {
      // If token is invalid or expired
      ApiClient.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await ApiClient.post('/auth/login', { email, password });
      if (res.success && res.tokens) {
        ApiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        setUser(res.user);
        localStorage.setItem('mymall_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Invalid email or password' };
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: Role;
  }) => {
    try {
      const res = await ApiClient.post('/auth/register', payload);
      if (res.success && res.tokens) {
        ApiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        setUser(res.user);
        localStorage.setItem('mymall_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Registration error' };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const res = await ApiClient.post('/auth/send-otp', { email });
      return {
        success: !!res.success,
        message: res.message || 'OTP verification code sent',
        devOtp: res.devOtp,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Could not send verification code' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await ApiClient.post('/auth/verify-otp', { email, otp });
      return {
        success: !!res.success,
        message: res.message || 'Code verified successfully',
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Invalid code' };
    }
  };

  const chooseRole = async (targetRole: 'STORE_OWNER' | 'CUSTOMER') => {
    try {
      const res = await ApiClient.post('/auth/choose-role', { targetRole });
      if (res.success && res.tokens) {
        ApiClient.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    ApiClient.clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Demo switcher to preview different role screens without relogging
  const switchRolePreview = (newRole: Role, newStaffRole?: StaffRole) => {
    if (!user) {
      // Mock user for immediate preview
      const mock: User = {
        id: 999,
        email: `${newRole.toLowerCase()}@mymall.com`,
        name: `Preview ${newRole.replace('_', ' ')}`,
        role: newRole,
        staffRole: newStaffRole || (newRole === 'STORE_STAFF' ? 'CASHIER' : null),
        storeId: 1,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mock);
      localStorage.setItem('mymall_user', JSON.stringify(mock));
    } else {
      const updated = {
        ...user,
        role: newRole,
        staffRole: newStaffRole || null,
      };
      setUser(updated);
      localStorage.setItem('mymall_user', JSON.stringify(updated));
    }
  };

  const role = user?.role || 'CUSTOMER';
  const staffRole = user?.staffRole;
  const storeId = user?.storeId || (user?.ownedStores && user.ownedStores.length > 0 ? user.ownedStores[0].id : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        staffRole,
        storeId,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        switchRolePreview,
        sendOtp,
        verifyOtp,
        chooseRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
