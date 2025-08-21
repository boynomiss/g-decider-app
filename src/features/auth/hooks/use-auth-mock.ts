// Mock Auth Hook
// Replace real authentication with mock data for UI development

import { useState, useCallback, useEffect } from 'react';
import { mockFirebaseClient } from '../../../services/mock/api';

export const useAuthMock = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial auth state check
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = mockFirebaseClient.auth().currentUser;
      setUser(mockUser);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate sign in delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await mockFirebaseClient.auth().signInWithEmailAndPassword(email, password);
      setUser(result.user);
      setLoading(false);
      return result;
    } catch (err) {
      setError('Mock sign in failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate sign out delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await mockFirebaseClient.auth().signOut();
      setUser(null);
      setLoading(false);
    } catch (err) {
      setError('Mock sign out failed');
      setLoading(false);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate sign up delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser = { uid: 'mock_new_user_123', email };
      setUser(mockUser);
      setLoading(false);
      return { user: mockUser };
    } catch (err) {
      setError('Mock sign up failed');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    isAuthenticated: !!user
  };
};
