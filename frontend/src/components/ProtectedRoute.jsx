import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * A wrapper component that checks for user authentication and role authorization.
 */
const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        // Show a loading spinner while checking authentication status
        return (
            <div className="text-center py-20 text-gray-500">
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                Loading user session...
            </div>
        );
    }

    // 1. Protection Check: If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />; 
    }

    // 2. Authorization Check: If role is required but doesn't match, redirect to home
    if (roles.length > 0 && !roles.includes(role)) {
        return <Navigate to="/" replace />; 
    }

    // 3. Authorized: Render the requested page
    return children;
};

export default ProtectedRoute;