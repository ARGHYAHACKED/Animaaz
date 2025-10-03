import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { initializeSocket, disconnectSocket } from '../utils/socket';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      newAnime: boolean;
      groupUpdates: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for auth token and initialize socket
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Wait for user to be set before initializing socket
      if (user && user.id) {
        initializeSocket(token, user.id);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      disconnectSocket();
    }
  }, [token, user]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('https://animaaz.onrender.com/api/auth/me');
          const d = response.data;
          setUser({
            id: d._id || d.id,
            username: d.username,
            email: d.email,
            role: d.role,
            avatar: d.avatar,
            preferences: d.preferences,
          });
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('https://animaaz.onrender.com/api/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.username}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('https://animaaz.onrender.com/api/auth/register', {
        username,
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      toast.success(`Welcome to AnimeHub, ${userData.username}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('https://animaaz.onrender.com/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      disconnectSocket();
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};