import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Lock, User, Phone } from 'lucide-react-native';
import { Mail } from 'lucide-react-native';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { useAuth } from '../features/auth';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, isLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isSignUp && !formData.name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      if (isSignUp) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', name: '', phone: '' });
  };

  const handleBackPress = () => router.back();
  
  const handleNameChange = (text: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.name = text;
      return newData;
    });
  };
  const handleEmailChange = (text: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.email = text;
      return newData;
    });
  };
  const handlePasswordChange = (text: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.password = text;
      return newData;
    });
  };
  const handlePhoneChange = (text: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData.phone = text;
      return newData;
    });
  };

  return (
    <ErrorBoundary componentName="AuthScreen">
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ErrorBoundary componentName="AuthContent">
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <ErrorBoundary componentName="AuthHeader">
                <View style={styles.header}>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <ArrowLeft size={24} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </Text>
                  <View style={styles.placeholder} />
                </View>
              </ErrorBoundary>

              {/* Form */}
              <ErrorBoundary componentName="AuthForm">
                <View style={styles.formContainer}>
                  <Text style={styles.subtitle}>
                    {isSignUp 
                      ? 'Sign up to get unlimited tries and save your preferences' 
                      : 'Sign in to continue your G! journey'
                    }
                  </Text>

                  {isSignUp && (
                    <ErrorBoundary componentName="NameInput">
                      <View style={styles.inputContainer}>
                        <User size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={formData.name}
                          onChangeText={handleNameChange}
                          placeholder="Full Name"
                          placeholderTextColor="#999"
                          autoCapitalize="words"
                        />
                      </View>
                    </ErrorBoundary>
                  )}

                  <ErrorBoundary componentName="EmailInput">
                    <View style={styles.inputContainer}>
                      <Mail size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.email}
                                                  onChangeText={handleEmailChange}
                        placeholder="Email Address"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </ErrorBoundary>

                  <ErrorBoundary componentName="PasswordInput">
                    <View style={styles.inputContainer}>
                      <Lock size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.password}
                                                  onChangeText={handlePasswordChange}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                      />
                    </View>
                  </ErrorBoundary>

                  {isSignUp && (
                    <ErrorBoundary componentName="PhoneInput">
                      <View style={styles.inputContainer}>
                        <Phone size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={formData.phone}
                          onChangeText={handlePhoneChange}
                          placeholder="Phone Number (Optional)"
                          placeholderTextColor="#999"
                          keyboardType="phone-pad"
                        />
                      </View>
                    </ErrorBoundary>
                  )}

                  <ErrorBoundary componentName="SubmitButton">
                    <TouchableOpacity 
                      style={styles.submitButton} 
                      onPress={handleSubmit}
                      disabled={isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                      </Text>
                    </TouchableOpacity>
                  </ErrorBoundary>

                  <ErrorBoundary componentName="ToggleMode">
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                      <Text style={styles.toggleText}>
                        {isSignUp 
                          ? 'Already have an account? Sign In' 
                          : "Don't have an account? Sign Up"
                        }
                      </Text>
                    </TouchableOpacity>
                  </ErrorBoundary>
                </View>
              </ErrorBoundary>
            </ScrollView>
          </ErrorBoundary>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    color: '#8B5FBF',
    fontSize: 14,
    fontWeight: '500',
  },
  demoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});