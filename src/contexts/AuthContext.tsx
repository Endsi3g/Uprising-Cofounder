import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  goal?: string;
  onboarding_completed?: number;
  notifications_enabled: number;
  theme: string;
  default_mode: string;
  bland_api_key?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  elevenlabs_api_key?: string;
  twenty_api_key?: string;
  credits?: number;
  referral_code?: string;
  referred_by?: string;
  mfa_enabled?: boolean;
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  loading: boolean;
  skipLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (token && token !== 'dev-mock-token') {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const skipLogin = () => {
    const mockUser: User = {
      id: 'dev-user-id',
      email: 'dev@uprising.ca',
      name: 'Agent de Développement',
      role: 'admin',
      onboarding_completed: 1,
      notifications_enabled: 1,
      theme: 'light',
      default_mode: 'create',
      credits: 999
    };
    const mockToken = 'dev-mock-token';
    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser(mockUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, checkAuth, loading, skipLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
