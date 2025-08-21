import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

/**
 * Card Component Props
 * @interface CardProps
 * @property {React.ReactNode} children - Content to display inside the card
 * @property {'elevated' | 'outlined' | 'flat'} variant - Card style variant
 * @property {'small' | 'medium' | 'large'} padding - Card padding size
 * @property {ViewStyle} style - Additional styles for the card
 * @property {boolean} rounded - Whether to apply rounded corners
 * @property {string} testID - Test identifier for testing
 */
interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  rounded?: boolean;
  testID?: string;
}

/**
 * A reusable card component for displaying content in containers
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="medium">
 *   <Text>Card content goes here</Text>
 * </Card>
 * ```
 */
export default function Card({
  children,
  variant = 'elevated',
  padding = 'medium',
  style,
  rounded = true,
  testID
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[padding],
    rounded && styles.rounded,
    style
  ];

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  // Variants
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  flat: {
    borderWidth: 0,
  },
  
  // Padding sizes
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 24,
  },
  
  // Rounded corners
  rounded: {
    borderRadius: 12,
  },
});
