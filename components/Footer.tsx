import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuth } from '@/hooks/use-auth';

export default function Footer() {
  const { retriesLeft } = useAppStore();
  const { isAuthenticated, user } = useAuth();

  const handleUpgradePress = () => {
    if (isAuthenticated) {
      router.push('/upgrade');
    } else {
      router.push('/auth');
    }
  };

  const getRetriesText = () => {
    if (isAuthenticated && user?.isPremium) {
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
    if (isAuthenticated && user?.isPremium) {
      return 'Premium Active';
    }
    if (isAuthenticated) {
      return 'Upgrade to Premium';
    }
    return 'Sign up for unlimited tries';
  };

  return (
    <View style={styles.container}>
      <Text style={[
        styles.retriesText,
        retriesLeft === 0 && styles.noRetriesText
      ]}>
        {getRetriesText()}
      </Text>
      <TouchableOpacity onPress={handleUpgradePress}>
        <Text style={[
          styles.upgradeText,
          isAuthenticated && user?.isPremium && styles.premiumText
        ]}>
          {getUpgradeText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 16,
  },
  retriesText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  upgradeText: {
    fontSize: 14,
    color: '#8B5FBF',
    fontWeight: '500',
  },
  noRetriesText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  premiumText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});