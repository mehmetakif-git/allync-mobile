import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isLoginPage = segments[0] === 'login';

    // If no session and trying to access protected routes, redirect to login
    if (!session && inAuthGroup) {
      router.replace('/login');
    }
    // If has session and on login page, redirect to home
    else if (session && isLoginPage) {
      router.replace('/(tabs)');
    }
    // If has session but not in any specific route, go to home
    else if (session && !inAuthGroup && !isLoginPage && segments.length === 0) {
      router.replace('/(tabs)');
    }
    // If no session and not on login, go to login
    else if (!session && !isLoginPage && segments.length === 0) {
      router.replace('/login');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AuthGuard>
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    animationDuration: 300,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </AuthGuard>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
