/**
 * Authentication Context
 * 
 * Purpose: Manage fake authentication state for the demo.
 * 
 * Design:
 * - Simple fake login (no real authentication)
 * - Stores user state in React context
 * - Persists to localStorage for demo purposes
 * 
 * Note: This is NOT real authentication. It's for demonstration only.
 * In a real application, this would use proper authentication with tokens.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * User Interface
 */
interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Auth Context Interface
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * 
 * Provides authentication state and methods to the entire app.
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Load user from localStorage on mount
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('demo_user');
      }
    }
  }, []);

  /**
   * Fake Login
   * 
   * Simulates login by accepting any credentials.
   * In a real app, this would validate against a backend.
   * 
   * @param email - User email
   * @param password - User password (not actually validated)
   * @returns True if "login" successful
   */
  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Accept any credentials for demo
    const fakeUser: User = {
      id: 'user-' + Date.now(),
      email,
      name: email.split('@')[0] // Use email prefix as name
    };

    setUser(fakeUser);
    localStorage.setItem('demo_user', JSON.stringify(fakeUser));

    console.log('[Auth] Fake login successful:', email);
    return true;
  };

  /**
   * Fake Signup
   * 
   * Simulates signup by accepting any credentials.
   * In a real app, this would create an account on the backend.
   * 
   * @param email - User email
   * @param password - User password (not actually stored)
   * @param name - User name
   * @returns True if "signup" successful
   */
  const signup = async (email: string, _password: string, name: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Accept any credentials for demo
    const fakeUser: User = {
      id: 'user-' + Date.now(),
      email,
      name
    };

    setUser(fakeUser);
    localStorage.setItem('demo_user', JSON.stringify(fakeUser));

    console.log('[Auth] Fake signup successful:', email);
    return true;
  };

  /**
   * Logout
   * 
   * Clears user state and localStorage.
   */
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('demo_user');
    console.log('[Auth] Logged out');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * Custom hook to access auth context.
 * 
 * @returns Auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
