/**
 * Auth Interface Types
 * 
 * Defines user and authentication state interfaces
 */

// =================
// USER INTERFACE
// =================

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isPremium: boolean;
  createdAt: string;
}

// =================
// AUTH STATE INTERFACE
// =================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
}

// =================
// AUTH CONTEXT INTERFACE
// =================

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
