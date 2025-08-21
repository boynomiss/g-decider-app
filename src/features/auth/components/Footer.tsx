import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTokens } from '../hooks/use-tokens';

export default function Footer() {
  const { tokensLeft, getTokensText, getUpgradeText, isAuthenticated, user } = useTokens();

  const handleUpgradePress = () => {
    console.log('Footer: Upgrade button pressed');
    console.log('Footer: isAuthenticated:', isAuthenticated);
    console.log('Footer: user:', user);
    
    if (isAuthenticated) {
      console.log('Footer: Navigating to /upgrade');
      router.push('/upgrade');
    } else {
      console.log('Footer: Navigating to /auth');
      try {
        router.push('/auth');
        console.log('Footer: Navigation to /auth successful');
      } catch (error) {
        console.error('Footer: Navigation to /auth failed:', error);
      }
    }
  };

  console.log('Footer: Rendering with isAuthenticated:', isAuthenticated, 'user:', user);

  return (
    <View style={styles.container}>
      <View style={styles.tokenSection}>
        <Text style={[
          styles.tokensText,
          tokensLeft === 0 && styles.noTokensText
        ]}>
          {getTokensText(tokensLeft)}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={handleUpgradePress}
        activeOpacity={0.6}
        style={styles.upgradeButton}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        testID="footer-upgrade-button"
      >
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  tokenSection: {
    alignItems: 'flex-start',
  },
  tokensText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  noTokensText: {
    color: '#dc3545',
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5FBF',
  },
  premiumText: {
    color: '#28a745',
    fontWeight: '600',
  },
  upgradeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 95, 191, 0.3)',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 95, 191, 0.5)',
  },
});