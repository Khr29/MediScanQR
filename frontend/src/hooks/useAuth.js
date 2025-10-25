// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to consume the AuthContext.
 * Provides easy access to user state, role, loading status,
 * authentication functions (login, register, logout), and the
 * global toast notification setter.
 *
 * @returns {object} The authentication context value.
 */
export const useAuth = () => {
    // This assumes AuthContext has been provided higher up in the component tree
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};