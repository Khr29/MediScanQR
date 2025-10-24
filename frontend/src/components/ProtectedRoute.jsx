import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that checks for user authentication and role authorization.
 * If not authenticated, it redirects to the Login page.
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  // 1. Check Authentication Status from localStorage
  // The 'user' item holds the logged-in user's data (including the token/role).
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Protection Check: Redirect if no user is found
  if (!user) {
    // This line forces the app to render the LoginPage component
    return <Navigate to="/login" replace />; 
  }

  // 3. Authorization Check: Check if the user's role is permitted
  // The user role is stored as 'user.role'.
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to the home page or a 403 Forbidden page on role mismatch
    return <Navigate to="/" replace />; 
  }

  // 4. Authorized: Render the children (e.g., DashboardPage)
  return children;
};

export default ProtectedRoute;