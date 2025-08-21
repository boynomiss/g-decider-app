import { useAuth } from './use-auth';

/**
 * Hook for managing user tokens and premium status
 * 
 * Token System:
 * - Non-authenticated: 1 token (no refresh)
 * - Registered users: 3 tokens (refresh at midnight, max 3)
 * - Premium users: 10 tokens (refresh at midnight, max 10)
 */
export const useTokens = () => {
  const { isAuthenticated, user } = useAuth();

  // Helper function to check if it's a new day since last token refresh
  const isAfterMidnight = (lastRefresh: string): boolean => {
    if (!lastRefresh) return true;
    
    const now = new Date();
    const lastRefreshDate = new Date(lastRefresh);
    
    // Check if it's a new day (after midnight)
    return now.getDate() !== lastRefreshDate.getDate() || 
           now.getMonth() !== lastRefreshDate.getMonth() || 
           now.getFullYear() !== lastRefreshDate.getFullYear();
  };

  // Helper function to get user's local midnight time
  const getLocalMidnight = (): Date => {
    const now = new Date();
    const localMidnight = new Date(now);
    localMidnight.setHours(0, 0, 0, 0);
    return localMidnight;
  };

  // Calculate available tokens with midnight reset logic
  const calculateTokens = () => {
    if (!isAuthenticated || !user) {
      return 1; // Non-authenticated users get 1 token
    }

    // Check if it's a new day since last refresh
    const isNewDay = isAfterMidnight(user.lastTokenRefresh);
    
    if (isNewDay) {
      // New day - refresh tokens based on user type
      if (user.isPremium) {
        return 10; // Premium users get 10 tokens at midnight
      } else {
        return 3; // Free users get 3 tokens at midnight
      }
    }

    // Same day - return current token count (capped appropriately)
    if (user.isPremium) {
      return Math.min(user.tokens, 10); // Premium: max 10 tokens
    } else {
      return Math.min(user.tokens, 3); // Free: max 3 tokens
    }
  };

  const tokensLeft = calculateTokens();

  // Function to consume a token (called when user uses a feature)
  const consumeToken = () => {
    if (!isAuthenticated || !user) {
      return false; // Can't consume tokens if not authenticated
    }

    if (tokensLeft <= 0) {
      return false; // No tokens left
    }

    // In a real app, this would update the user's token count in the backend
    return true;
  };

  const getTokensText = (tokensLeft: number) => {
    if (tokensLeft === 0) {
      return 'No tokens left';
    }
    if (tokensLeft === 1) {
      return '1 token left';
    }
    if (tokensLeft === 3) {
      return '3 tokens left';
    }
    if (tokensLeft === 10) {
      return '10 tokens left';
    }
    return `${tokensLeft} tokens left`;
  };

  const getUpgradeText = () => {
    if (isAuthenticated && user && user.isPremium) {
      return 'Premium Active';
    }
    if (isAuthenticated) {
      return 'Upgrade to Premium';
    }
    return 'Sign up to earn 3 tokens';
  };

  // Function to get time until next token refresh
  const getTimeUntilRefresh = (): string => {
    if (!user?.lastTokenRefresh) return 'Unknown';
    
    const now = new Date();
    const lastRefresh = new Date(user.lastTokenRefresh);
    const nextMidnight = new Date(lastRefresh);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    
    const timeDiff = nextMidnight.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m until refresh`;
    }
    return `${minutes}m until refresh`;
  };

  return {
    tokensLeft,
    getTokensText,
    getUpgradeText,
    getTimeUntilRefresh,
    isAuthenticated,
    user,
    consumeToken,
    isAfterMidnight,
    getLocalMidnight
  };
};
