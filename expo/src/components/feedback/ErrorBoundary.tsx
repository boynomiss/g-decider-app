import * as React from 'react';
import { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Global error handler for centralized error reporting
export const globalErrorHandler = (error: Error, errorInfo: React.ErrorInfo, componentName?: string) => {
  console.error('Global Error Handler:', {
    component: componentName || 'Unknown',
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  });
  
  // Here you could send errors to a service like Sentry, Crashlytics, etc.
  // Example: Sentry.captureException(error, { extra: { componentName, errorInfo } });
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Call global error handler
    globalErrorHandler(error, errorInfo, this.props.componentName);

    // Log error details for debugging
    console.error('Component:', this.props.componentName || 'Unknown');
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);

    this.setState({ errorInfo: errorInfo || undefined });
  }

  handleRetry = () => {
    this.setState({
      hasError: false
    });
  };

  handleReportError = () => {
    const { error } = this.state;
    const componentName = this.props.componentName || 'Unknown Component';
    
    Alert.alert(
      'Error Details',
      `Component: ${componentName}\n\nError: ${error?.message}\n\nStack: ${error?.stack?.substring(0, 200)}...`,
      [{ text: 'OK' }]
    );
  };

  getErrorMessage = () => {
    const { error } = this.state;
    const componentName = this.props.componentName || 'this component';
    
    if (!error) return 'An unexpected error occurred';
    
    // Provide more specific error messages based on error type
    if (error.name === 'TypeError') {
      return `Something went wrong with ${componentName}. Please try again.`;
    }
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return 'Data loading error. Please try refreshing the app.';
    }
    
    return error.message || 'An unexpected error occurred';
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.getErrorMessage()}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.reportButton} onPress={this.handleReportError}>
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Higher-Order Component to wrap components with ErrorBoundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
  fallback?: ReactNode
) => {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary 
      componentName={componentName || WrappedComponent.name}
      fallback={fallback}
      onError={globalErrorHandler}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.name})`;
  return WithErrorBoundary;
};

// Specialized error boundaries for different use cases
export const NetworkErrorBoundary = ({ children, componentName }: { children: ReactNode; componentName?: string }) => (
  <ErrorBoundary 
    {...(componentName && { componentName })}
    onError={(error, errorInfo) => {
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        console.error('Network error detected:', error.message);
      }
      globalErrorHandler(error, errorInfo, componentName);
    }}
  >
    {children}
  </ErrorBoundary>
);

export const DataErrorBoundary = ({ children, componentName }: { children: ReactNode; componentName?: string }) => (
  <ErrorBoundary 
    {...(componentName && { componentName })}
    onError={(error, errorInfo) => {
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        console.error('Data parsing error detected:', error.message);
      }
      globalErrorHandler(error, errorInfo, componentName);
    }}
  >
    {children}
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 