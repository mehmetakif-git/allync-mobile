import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MeshGlowBackgroundProps {
  children: React.ReactNode;
}

export default function MeshGlowBackground({ children }: MeshGlowBackgroundProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1429',  // Solid dark blue
  },
});
