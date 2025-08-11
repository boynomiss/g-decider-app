import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useEffect, createContext, useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContext } from "../store/store";
import { AuthProvider } from "../features/auth/hooks/use-auth";
import { ErrorBoundary } from "../components/feedback/ErrorBoundary";
import colors from "../shared/constants/constants/colors";
import { useComponentDebug, useRequiredComponentsValidation } from "../shared/hooks/use-component-validation";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Create a ThemeContext for colors
const ThemeContext = createContext<typeof colors.light | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={colors.light}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

function RootLayoutNav() {
  return (
    <ErrorBoundary componentName="RootLayoutNav">
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="upgrade" options={{ headerShown: false }} />
        <Stack.Screen name="saved-places" options={{ headerShown: false }} />
        <Stack.Screen name="instant-recommendations" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Component validation - check that all critical components are available
  const criticalComponents: Record<string, React.ComponentType<any> | undefined> = {
    QueryClientProvider,
    Stack,
    GestureHandlerRootView,
    SafeAreaProvider,
    AppContext,
    AuthProvider,
    ErrorBoundary,
    ThemeProvider
  };

  // Debug component availability in development
  useComponentDebug(criticalComponents);

  // Validate that all required components are available
  const allComponentsAvailable = useRequiredComponentsValidation(criticalComponents);

  // Show error if critical components are missing
  if (!allComponentsAvailable) {
    console.error('❌ Critical components are missing. App may not function properly.');
    return React.createElement('div', {
      style: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 20
      }
    }, 'Error: Critical components are missing. Check console for details.');
  }

  return (
    <ErrorBoundary componentName="RootLayout">
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContext>
              <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </ThemeProvider>
            </AppContext>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
