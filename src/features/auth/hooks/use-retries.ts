import { useAuth } from './use-auth';

export const useRetries = () => {
  const { isAuthenticated, user } = useAuth();

  // Default retries value - in a real app this would come from a subscription or user preferences
  const retriesLeft = 3;

  const getRetriesText = (retriesLeft: number) => {
    if (isAuthenticated && user && user.isPremium) {
      return 'Unlimited tries';
    }
    if (retriesLeft === -1) {
      return 'Unlimited tries';
    }
    if (retriesLeft === 0) {
      return 'No retries left';
    }
    return `${retriesLeft} retries left`;
  };

  const getUpgradeText = () => {
    if (isAuthenticated && user && user.isPremium) {
      return 'Premium Active';
    }
    if (isAuthenticated) {
      return 'Upgrade to Premium';
    }
    return 'Sign up for unlimited tries';
  };

  return {
    retriesLeft,
    getRetriesText,
    getUpgradeText,
    isAuthenticated,
    user
  };
};
