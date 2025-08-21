import { useState, useCallback } from 'react';
import { useTokens } from './use-tokens';
import { useAuth } from './use-auth';

/**
 * Hook for managing token consumption and providing upgrade prompts
 */
export const useTokenConsumption = () => {
  const { retriesLeft, consumeToken, getTimeUntilRefresh } = useTokens();
  const { user, isAuthenticated } = useAuth();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [lastConsumptionTime, setLastConsumptionTime] = useState<Date | null>(null);

  /**
   * Attempt to consume a token for a feature
   */
  const attemptTokenConsumption = useCallback((featureName: string = 'search') => {
    if (!isAuthenticated || !user) {
      setShowUpgradePrompt(true);
      return { success: false, reason: 'not_authenticated' as const };
    }

    if (retriesLeft <= 0) {
      setShowUpgradePrompt(true);
      return { success: false, reason: 'no_tokens' as const };
    }

    // Consume the token
    const consumed = consumeToken();
    if (consumed) {
      setLastConsumptionTime(new Date());
      console.log(`✅ Token consumed for ${featureName}. ${retriesLeft - 1} tokens remaining.`);
      return { success: true, tokensRemaining: retriesLeft - 1 };
    }

    return { success: false, reason: 'consumption_failed' as const };
  }, [isAuthenticated, user, retriesLeft, consumeToken]);

  /**
   * Check if user can perform an action
   */
  const canPerformAction = useCallback((actionName: string = 'search') => {
    if (!isAuthenticated) return false;
    if (retriesLeft <= 0) return false;
    return true;
  }, [isAuthenticated, retriesLeft]);

  /**
   * Get upgrade prompt message
   */
  const getUpgradeMessage = useCallback(() => {
    if (!isAuthenticated) {
      return {
        title: 'Sign Up Required',
        message: 'Please sign up to get 3 free searches per day!',
        action: 'Sign Up'
      };
    }

    if (retriesLeft <= 0) {
      return {
        title: 'Out of Tokens',
        message: `You've used all your daily searches. Upgrade to Premium for 10 searches per day!`,
        action: 'Upgrade to Premium',
        timeUntilRefresh: getTimeUntilRefresh()
      };
    }

    return null;
  }, [isAuthenticated, retriesLeft, getTimeUntilRefresh]);

  /**
   * Dismiss upgrade prompt
   */
  const dismissUpgradePrompt = useCallback(() => {
    setShowUpgradePrompt(false);
  }, []);

  /**
   * Get token status summary
   */
  const getTokenStatus = useCallback(() => {
    return {
      tokensLeft: retriesLeft,
      isAuthenticated,
      isPremium: user?.isPremium || false,
      timeUntilRefresh: getTimeUntilRefresh(),
      lastConsumption: lastConsumptionTime,
      canPerformActions: canPerformAction()
    };
  }, [retriesLeft, isAuthenticated, user?.isPremium, getTimeUntilRefresh, lastConsumptionTime, canPerformAction]);

  return {
    // Token consumption
    attemptTokenConsumption,
    canPerformAction,
    
    // Upgrade prompts
    showUpgradePrompt,
    getUpgradeMessage,
    dismissUpgradePrompt,
    
    // Status
    getTokenStatus,
    
    // Current state
    tokensLeft: retriesLeft,
    isAuthenticated,
    isPremium: user?.isPremium || false
  };
};
