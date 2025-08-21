import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

/**
 * Button Component Props
 * @interface ButtonProps
 * @property {string} title - The text to display on the button
 * @property {() => void} onPress - Function called when button is pressed
 * @property {'primary' | 'secondary' | 'outline' | 'ghost'} variant - Button style variant
 * @property {'small' | 'medium' | 'large'} size - Button size
 * @property {boolean} disabled - Whether the button is disabled
 * @property {boolean} loading - Whether to show loading state
 * @property {ViewStyle} style - Additional styles for the button container
 * @property {TextStyle} textStyle - Additional styles for the button text
 * @property {string} testID - Test identifier for testing
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * A reusable button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button 
 *   title="Press Me" 
 *   onPress={() => console.log('Pressed!')}
 *   variant="primary"
 *   size="medium"
 * />
 * ```
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      <Text style={textStyleCombined}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: '#7DD3C0',
  },
  secondary: {
    backgroundColor: '#F0F0F0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7DD3C0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#4A4A4A',
  },
  outlineText: {
    color: '#7DD3C0',
  },
  ghostText: {
    color: '#7DD3C0',
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    color: '#999999',
  },
});
