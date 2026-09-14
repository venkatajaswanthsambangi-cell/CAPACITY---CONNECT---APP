import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (data: { name: string; email: string; department?: string; title?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (targetRole: UserRole) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  hasRole: (allowed: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const isLoggedOut = localStorage.getItem('capacity_connect_logged_out') === 'true';
      if (isLoggedOut) {
        setUser(null);
        setLoading(false);
        return;
      }

      let savedEmail = localStorage.getItem('capacity_connect_email');
      // Default to initial configured admin on first load if not explicitly logged out
      if (!savedEmail) {
        savedEmail = 'venkatajaswanthsambangi@gmail.com';
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'x-user-email': savedEmail
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('capacity_connect_email', data.user.email);
        localStorage.removeItem('capacity_connect_logged_out');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('capacity_connect_email', data.user.email);
      localStorage.removeItem('capacity_connect_logged_out');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; department?: string; title?: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      const resData = await res.json();
      setUser(resData.user);
      localStorage.setItem('capacity_connect_email', resData.user.email);
      localStorage.removeItem('capacity_connect_logged_out');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('capacity_connect_email');
    localStorage.setItem('capacity_connect_logged_out', 'true');
    setUser(null);
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('capacity_connect_email', data.user.email);
        localStorage.removeItem('capacity_connect_logged_out');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': user.email
      },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  };

  const hasRole = (allowed: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return allowed.includes(user.role);
  };

  const isSuperAdmin = Boolean(
    user && (user.role === 'super_admin' || user.email.toLowerCase() === 'venkatajaswanthsambangi@gmail.com')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'learner',
        isSuperAdmin,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        updateProfile,
        hasRole,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
