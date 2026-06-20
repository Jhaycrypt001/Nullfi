import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  createdAt?: string;
}

interface CreditScore {
  rating: number;
  tier: string;
  borrowLimit: string;
}

interface AuthContextType {
  user: User | null;
  creditScore: CreditScore | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (walletAddress: string, message: string, signature: string, publicKey: string) => Promise<void>;
  logout: () => void;
  refreshCreditScore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          setToken(storedToken);
          api.setToken(storedToken);
          // Try to refresh credit score, but don't block if it fails
          try {
            const response = await api.getCreditScore(user.id);
            if (response.success && response.creditScore) {
              setCreditScore(response.creditScore);
            }
          } catch (e) {
            console.log('Could not refresh credit score');
          }
        } catch (e) {
          console.error('Failed to restore session:', e);
          logout();
        }
      }
    };

    initAuth();
  }, []);

  const verifyUserToken = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          setToken(storedToken);
          api.setToken(storedToken);
          await refreshCreditScore();
        } catch (e) {
          logout();
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (
    walletAddress: string,
    message: string,
    signature: string,
    publicKey: string
  ) => {
    setIsLoading(true);
    try {
      const response = await api.verifySignature(walletAddress, message, signature, publicKey);

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setCreditScore(response.creditScore || null);
        setToken(response.token);
        api.setToken(response.token);

        // Store user data in localStorage for persistence on refresh
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCreditScore(null);
    setToken(null);
    api.clearToken();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const refreshCreditScore = async () => {
    try {
      if (user) {
        const response = await api.getCreditScore(user.id);
        if (response.success && response.creditScore) {
          setCreditScore(response.creditScore);
        }
      }
    } catch (error) {
      console.error('Failed to refresh credit score:', error);
    }
  };

  const value: AuthContextType = {
    user,
    creditScore,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshCreditScore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
