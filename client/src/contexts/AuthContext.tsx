import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API_CONFIG from '@/config/api';

// TypeScript types - define the shape of our data
interface User {
  username: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;              // Current logged-in user (or null if not logged in)
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;       // Quick check: is someone logged in?
  error: string | null;           // Error message from last failed attempt
}

// Create the Context with a default value of undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component - wraps the entire app and provides auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On app load, check if user was previously logged in (token in localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // LOGIN function - sends credentials to backend, stores token
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(API_CONFIG.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Login failed');
        return false;
      }

      const data = await response.json();
      const userData: User = {
        username: data.username,
        role: data.role,
        token: data.token,
      };

      // Save to state AND localStorage (so it persists after refresh)
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch {
      setError('Network error. Is the backend running?');
      return false;
    }
  };

  // REGISTER function - creates new account, stores token
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(API_CONFIG.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Email: email, Password: password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Registration failed');
        return false;
      }

      const data = await response.json();
      const userData: User = {
        username: data.username,
        role: data.role,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch {
      setError('Network error. Is the backend running?');
      return false;
    }
  };

  // LOGOUT function - clears everything
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
  };

  // Provide all auth state and functions to children components
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,  // Convert user to boolean (null = false, object = true)
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook - makes it easy to use auth in any component
// Usage: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
