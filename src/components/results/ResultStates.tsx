import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StateBaseProps {
  onRetry?: () => void;
  testID?: string;
}

interface ErrorStateProps extends StateBaseProps {
  message: string;
}

export function LoadingState({ testID }: StateBaseProps) {
  return (
    <View style={styles.center} testID={testID ?? 'loading-state'}>
      <Text style={styles.loadingText}>🔍 Finding amazing places for you...</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry, testID }: ErrorStateProps) {
  return (
    <View style={styles.center} testID={testID ?? 'error-state'}>
      <Text style={styles.errorText}>❌ {message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Try Again" testID="retry-button">
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({ onRetry, testID }: StateBaseProps) {
  return (
    <View style={styles.center} testID={testID ?? 'empty-state'}>
      <Text style={styles.errorText}>🔍 No places found in your area</Text>
      <Text style={styles.subtleText}>Try adjusting your distance or category preferences</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Try Again" testID="retry-button-empty">
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtleText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default { LoadingState, ErrorState, EmptyState };
