import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { logAuditAction } from '../services/auditService';

interface User {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'employee' | 'superadmin';
  employeeId?: string;
  companyId?: string;
  currentCompanyId?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  isAuthReady: boolean;
  impersonateCompany: (companyId: string | null) => void;
  switchCompany: (companyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  });
  const [isAuthReady, setIsAuthReady] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (userData: User) => {
    try {
      if (!userData.id) {
        userData.id = crypto.randomUUID();
      }
      const response = await api.put<any>('users', userData.id, {
        ...userData,
        lastLogin: new Date().toISOString(),
      });
      if (response?.token) {
        localStorage.setItem('auth_token', response.token);
      }
    } catch (error) {
      console.error('Error syncing user to API:', error);
    }

    setUser(userData);
    logAuditAction({
      companyId: userData.companyId || 'system',
      userId: userData.id,
      userName: userData.name,
      action: 'Login',
      module: 'Auth',
      description: `User ${userData.name} logged in`,
    });
  };

  const logout = () => {
    if (user) {
      logAuditAction({
        companyId: user.companyId || 'system',
        userId: user.id,
        userName: user.name,
        action: 'Logout',
        module: 'Auth',
        description: `User ${user.name} logged out`,
      });
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const signInWithGoogle = async (idToken: string) => {
    const response = await api.post<{ token: string } & User>('auth/google', { idToken });
    if (response?.token) {
      localStorage.setItem('auth_token', response.token);
    }
    const userData: User = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
      avatar: response.avatar,
    };
    await login(userData);
  };

  const impersonateCompany = (companyId: string | null) => {
    if (user?.role === 'superadmin') {
      setUser((prev) =>
        prev ? { ...prev, companyId: companyId || undefined, currentCompanyId: companyId || undefined } : null
      );
    }
  };

  const switchCompany = (companyId: string) => {
    setUser((prev) => (prev ? { ...prev, currentCompanyId: companyId } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        signInWithGoogle,
        isAuthReady,
        impersonateCompany,
        switchCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
