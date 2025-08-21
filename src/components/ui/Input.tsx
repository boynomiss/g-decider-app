import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TextInputProps 
} from 'react-native';

/**
 * Input Component Props
 * @interface InputProps
 * @property {string} label - Label text above the input
 * @property {string} placeholder - Placeholder text inside the input
 * @property {string} value - Current input value
 * @property {(text: string) => void} onChangeText - Function called when text changes
 * @property {'text' | 'email' | 'password' | 'number'} type - Input type
 * @property {boolean} required - Whether the input is required
 * @property {string} error - Error message to display below input
 * @property {boolean} disabled - Whether the input is disabled
 * @property {ViewStyle} style - Additional styles for the input container
 * @property {TextStyle} inputStyle - Additional styles for the input field
 * @property {TextStyle} labelStyle - Additional styles for the label
 * @property {string} testID - Test identifier for testing
 */
interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  testID?: string;
}

/**
 * A reusable input component with label, validation, and error handling
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   type="email"
 *   required
 * />
 * ```
 */
export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  required = false,
  error,
  disabled = false,
  style,
  inputStyle,
  labelStyle,
  testID,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled
  ];

  const inputFieldStyle = [
    styles.input,
    inputStyle
  ];

  const labelTextStyle = [
    styles.label,
    required && styles.labelRequired,
    labelStyle
  ];

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case 'email':
        return 'none';
      default:
        return 'sentences';
    }
  };

  return (
    <View style={containerStyle} testID={testID}>
      {label && (
        <Text style={labelTextStyle}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        <TextInput
          style={inputFieldStyle}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          secureTextEntry={type === 'password'}
          placeholderTextColor="#999999"
          {...textInputProps}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  
  labelRequired: {
    color: '#E74C3C',
  },
  
  required: {
    color: '#E74C3C',
  },
  
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  
  inputContainerFocused: {
    borderColor: '#7DD3C0',
    borderWidth: 2,
  },
  
  inputContainerError: {
    borderColor: '#E74C3C',
  },
  
  inputContainerDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A4A4A',
  },
  
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: 4,
  },
});
