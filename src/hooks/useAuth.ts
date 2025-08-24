import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { authStorage } from '../utils/storage';
import { AuthData } from '../types/api';

interface User {
  username: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}


// Removed AUTH_STORAGE_KEY - now using authStorage service

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
        const authData = authStorage.getAuth() as AuthData | null;
        if (authData) {
          setAuthState({
            isAuthenticated: true,
            user: authData.user,
            loading: false
          });
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        authStorage.removeAuth();
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
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = await apiService.login(credentials.username, credentials.password);
      
      if (token && token.length > 0) {
        const user: User = {
          username: credentials.username,
          role: 'admin',
        };
        
        const authData: AuthData = {
          user,
          token,
          expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000,
        };
        
        const success = authStorage.setAuth(authData);
        if (success) {
          setAuthState({ isAuthenticated: true, user, loading: false });
        } else {
          throw new Error('Không thể lưu thông tin đăng nhập. Vui lòng thử lại.');
        }
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
      setLoginError(errorMessage);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = () => {
    authStorage.removeAuth();
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