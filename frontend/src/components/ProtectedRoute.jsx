import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Return null or a simple loading indicator while authentication status is being checked
    return null; 
  }

  // 1. Check Authentication
  if (!isAuthenticated) {
    // Not authenticated, redirect to login, preserving current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role Authorization (if roles are specified)
  if (roles && user && !roles.includes(user.role)) {
    // Authenticated but wrong role, redirect to dashboard or a 403 page
    alert(`Access Denied. You must be one of the following roles: ${roles.join(', ')}`);
    return <Navigate to="/" replace />; 
  }

  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;