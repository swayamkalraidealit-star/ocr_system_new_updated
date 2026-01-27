import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

// Define types matching our backend
export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, username?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get('/users/me');
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username?: string) => {
    try {
      // Use provided username or generate one based on name
      const finalUsername = username || (fullName.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000));
      
      await api.post('/users/register', {
        email,
        password,
        username: finalUsername,
      });
      
      // Auto login after register? Or just return success
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // OAuth2PasswordRequestForm expects form data
      const formData = new FormData();
      formData.append('username', email); // FastAPIs OAuth2 uses 'username' field for email usually
      formData.append('password', password);

      const data = await api.postForm('/users/token', formData);
      
      localStorage.setItem('token', data.access_token);
      await checkAuth();
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
