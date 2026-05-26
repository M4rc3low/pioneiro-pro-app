import React, { createContext, useState, useContext, useEffect } from 'react';
import { pioneiroApi } from '@/api/pioneiroClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({
    id: 'pioneiro-pro-local',
    public_settings: {
      name: 'Pioneiro Pro',
      mode: 'local'
    }
  });

  useEffect(() => {
    checkAppState();
  }, []);

  const checkUserAuth = async () => {
    try {
      const currentUser = await pioneiroApi.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthError({
        type: 'auth_required',
        message: 'Autenticação local indisponível'
      });
    }
  };

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      await checkUserAuth();
    } catch (error) {
      console.error('Unexpected auth error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Erro inesperado ao carregar autenticação local'
      });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  const logout = () => {
    pioneiroApi.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    checkUserAuth();
  };

  const navigateToLogin = () => {
    pioneiroApi.auth.redirectToLogin();
    checkUserAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
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
