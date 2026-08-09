import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser as apiLogin, logoutUser as apiLogout } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          apiLogout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);

    // Stored per-tab (sessionStorage) rather than shared across tabs
    // (localStorage), so logging into a different role in one tab can't
    // silently overwrite the token another open tab is relying on.
    const token = data?.token || data?.accessToken;
    if (token) {
      sessionStorage.setItem('token', token);
    }

    setUser(data.user);
    return data;
  };

  const logout = () => {
    apiLogout();
    sessionStorage.removeItem('token'); // Ensure token is wiped on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};