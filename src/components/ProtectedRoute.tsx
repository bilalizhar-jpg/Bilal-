import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'employee' | 'superadmin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/employee-portal')) {
      return <Navigate to="/employee-login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Special case: Super Admin can access Admin routes if impersonating a company
    if (user.role === 'superadmin' && allowedRoles.includes('admin') && user.companyId) {
      return <>{children}</>;
    }

    // Redirect to appropriate dashboard if role doesn't match
    if (user.role === 'superadmin') {
      return <Navigate to="/super-admin/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/employee-portal/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
