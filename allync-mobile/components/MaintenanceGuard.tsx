import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getActiveMaintenanceWindow } from '../lib/api/maintenanceWindows';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
interface MaintenanceGuardProps {
  children: React.ReactNode;
}
export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  useEffect(() => {
    checkMaintenanceStatus();
    // Check every 30 seconds for maintenance status changes
    const interval = setInterval(checkMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, [pathname]);
  const checkMaintenanceStatus = async () => {
    try {
      // Don't check if already on maintenance page
      if (pathname === '/maintenance') {
        setIsChecking(false);
        return;
      }
      const activeWindow = await getActiveMaintenanceWindow();
      if (activeWindow) {
        console.log('⚠️ [Mobile - MaintenanceGuard] Maintenance mode is active:', activeWindow);
        setIsMaintenanceActive(true);
      } else {
        setIsMaintenanceActive(false);
      }
    } catch (error) {
      console.error('❌ [Mobile - MaintenanceGuard] Failed to check maintenance status:', error);
      // On error, assume no maintenance to avoid blocking users
      setIsMaintenanceActive(false);
    } finally {
      setIsChecking(false);
    }
  };
  // Show loading while checking
  if (isChecking) {
    return (
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.blue[500]} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Checking system status...
        </Text>
      </View>
    );
  }
  // If maintenance is active and user is NOT super admin → redirect to maintenance page
  if (isMaintenanceActive && user?.role !== 'super_admin') {
    console.log('🚧 [Mobile - MaintenanceGuard] Redirecting to maintenance page');
    router.replace('/maintenance' as any);
    return null;
  }
  // If maintenance is NOT active but user is on maintenance page → redirect to home
  if (!isMaintenanceActive && pathname === '/maintenance') {
    console.log('✅ [Mobile - MaintenanceGuard] Maintenance ended, redirecting to home');
    router.replace('/(tabs)/' as any);
    return null;
  }
  // All checks passed, render children
  return <>{children}</>;
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});
