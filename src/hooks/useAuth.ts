import { useState, useEffect } from 'react';
import * as api from '../utils/apiClient';

interface User {
  username: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}


const AUTH_STORAGE_KEY = 'coffee-admin-auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          const now = new Date().getTime();
          
          // Check if session is still valid (24 hours)
          if (authData.expiresAt > now) {
            setAuthState({
              isAuthenticated: true,
              user: authData.user,
              loading: false
            });
            return;
          } else {
            // Session expired, remove from storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setLoginError("");
    try {
      // Use centralized api client
      const token = await api.login(credentials.username, credentials.password);
      if (token && token.length > 0) {
        const user: User = {
          username: credentials.username,
          role: 'admin',
        };
        const authData = {
          user,
          token,
          expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setAuthState({ isAuthenticated: true, user, loading: false });
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng hoặc lỗi hệ thống.');
      }
    } catch (err: unknown) {
      setLoginError((err as Error)?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    setLoginError('');
  };

  return {
    ...authState,
    login,
    logout,
    loginError
  };
};