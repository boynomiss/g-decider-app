import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Home } from 'lucide-react-native';
import { useAppStore } from '@/hooks/use-app-store';

export default function ConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentSuggestion, restartSession } = useAppStore();

  const handleGoHome = () => {
    restartSession();
    router.push('/');
  };

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top + 8,
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <View style={styles.successCard}>
          <CheckCircle size={80} color="#4CAF50" />
          
          <Text style={styles.title}>Booking Confirmed!</Text>
          
          <Text style={styles.subtitle}>
            Your booking for {currentSuggestion?.name || 'your selection'} has been confirmed.
          </Text>
          
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
            {currentSuggestion && (
              <>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Location: </Text>
                  {currentSuggestion.location}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Budget: </Text>
                  ₱{currentSuggestion.budget}
                </Text>
                {currentSuggestion.discount && (
                  <Text style={styles.discountText}>
                    🎉 {currentSuggestion.discount}
                  </Text>
                )}
              </>
            )}
          </View>
          
          <Text style={styles.message}>
            You&apos;ll receive a confirmation email shortly with all the details.
          </Text>
          
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Home size={20} color="#FFF" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#4A4A4A',
  },
  discountText: {
    fontSize: 14,
    color: '#856404',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginTop: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  homeButton: {
    backgroundColor: '#7DD3C0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 160,
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});