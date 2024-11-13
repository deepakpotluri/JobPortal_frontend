import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const loadAuthState = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userData');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuthState({
            user: parsedUser,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.clear();
          setAuthState({ user: null, isAuthenticated: false, loading: false });
        }
      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
      }
    };

    loadAuthState();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({ user: null, isAuthenticated: false, loading: false });
  };

  const value = {
    ...authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;