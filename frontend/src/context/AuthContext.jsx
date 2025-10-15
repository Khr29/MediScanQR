import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // <-- REQUIRES 'npm install jwt-decode'

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to decode and set user data from a token
  const processToken = useCallback((token) => {
    try {
      localStorage.setItem('jwtToken', token);
      const decoded = jwtDecode(token);
      
      // Ensure the token has necessary user info and is not expired
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        // The token payload contains user info (id, name, email, role)
        setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role // 'doctor', 'pharmacist', or 'user'
        });
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (error) {
      console.error("Error processing token:", error);
      logout();
    }
  }, []);

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      processToken(token);
    }
    setLoading(false);
  }, [processToken]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      
      // Store the token and set user state
      processToken(res.data.token);
      return res.data;
    } catch (error) {
      // Re-throw the error so the LoginPage can handle the failure message
      throw error;
    }
  };

  // Register function 
  const register = async (userData) => {
    try {
        const res = await registerApi(userData);
        // Log in immediately after registration (optional, but typical)
        processToken(res.data.token);
        return res.data;
    } catch (error) {
        throw error;
    }
  };


  // Logout function
  const logout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  // The context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  if (loading) {
    return <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontSize: '20px',
        color: 'var(--color-text)'
    }}>Loading Application...</div>;
  }

  // 3. Provide the value to the children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;