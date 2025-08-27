import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTokens } from '../hooks/use-tokens';

type PositioningMode = 'overlay' | 'inline';

interface FooterProps {
  positioningMode?: PositioningMode;
}

export default function Footer({ positioningMode = 'overlay' }: FooterProps) {
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
    <View style={[
      styles.container,
      positioningMode === 'overlay' ? styles.overlayContainer : styles.inlineContainer
    ]} pointerEvents="box-none">
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
        onPressIn={() => console.log('Footer: Button pressed in')}
        activeOpacity={0.6}
        style={[
          styles.upgradeButton,
          positioningMode === 'overlay' ? styles.overlayButton : styles.inlineButton
        ]}
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
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 20,
  },
  inlineContainer: {
    // Normal document flow - no special positioning
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
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayButton: {
    zIndex: 10000,
    elevation: 15,
  },
  inlineButton: {
    // Normal button styling for inline mode
  },
});