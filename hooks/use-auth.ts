import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types/app';

const AUTH_STORAGE_KEY = '@g_app_auth';
const USERS_STORAGE_KEY = '@g_app_users';

// Mock user database - in production this would be a real backend
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    phone: '+63 912 345 6789',
    isPremium: false,
    createdAt: new Date().toISOString()
  }
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Load auth state from storage on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        setAuthState({
          user: parsedAuth.user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Loaded auth state:', parsedAuth.user.email);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthState = async (user: User) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const signUp = useCallback(async (email: string, password: string, name?: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'User already exists with this email' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name,
        phone,
        isPremium: false,
        createdAt: new Date().toISOString()
      };

      // Add to mock database
      mockUsers.push(newUser);
      
      // Save to storage
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      await saveAuthState(newUser);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ User signed up successfully:', newUser.email);
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Failed to create account' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Find user in mock database
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'User not found' };
      }

      // In a real app, you'd verify the password here
      await saveAuthState(user);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ User signed in successfully:', user.email);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Failed to sign in' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'phone'>>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedUser = { ...authState.user, ...updates };
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === authState.user!.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      }

      await saveAuthState(updatedUser);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [authState.user]);

  const upgradeToPremium = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedUser = { ...authState.user, isPremium: true };
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === authState.user!.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
      }

      await saveAuthState(updatedUser);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      console.log('✅ Upgraded to premium successfully');
      return { success: true };
    } catch (error) {
      console.error('Premium upgrade error:', error);
      return { success: false, error: 'Failed to upgrade to premium' };
    }
  }, [authState.user]);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    upgradeToPremium
  };
});