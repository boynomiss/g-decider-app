import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useRetries } from '../hooks/use-retries';

export default function Footer() {
  const { retriesLeft, getRetriesText, getUpgradeText, isAuthenticated, user } = useRetries();

  const handleUpgradePress = () => {
    if (isAuthenticated) {
      router.push('/upgrade');
    } else {
      router.push('/auth');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[
        styles.retriesText,
        retriesLeft === 0 && styles.noRetriesText
      ]}>
        {getRetriesText(retriesLeft)}
      </Text>
      <TouchableOpacity onPress={handleUpgradePress}>
        <Text style={[
          styles.upgradeText,
          isAuthenticated && user && user.isPremium && styles.premiumText
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