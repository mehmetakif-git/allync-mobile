import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface MeshGlowBackgroundProps {
  children: React.ReactNode;
}

export default function MeshGlowBackground({ children }: MeshGlowBackgroundProps) {
  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      {/* Mesh Glow 1 - Sol üst - Yumuşak Blurred Circle */}
      <View style={styles.glow1Container}>
        <LinearGradient
          colors={[
            'rgba(59, 130, 246, 0.25)',
            'rgba(96, 165, 250, 0.12)',
            'transparent'
          ]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Mesh Glow 2 - Sağ alt - Yumuşak Blurred Circle */}
      <View style={styles.glow2Container}>
        <LinearGradient
          colors={[
            'rgba(147, 197, 253, 0.28)',
            'rgba(191, 219, 254, 0.15)',
            'transparent'
          ]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Mesh Glow 3 - Orta sağ - Yumuşak Blurred Circle */}
      <View style={styles.glow3Container}>
        <LinearGradient
          colors={[
            'rgba(99, 102, 241, 0.25)',
            'rgba(139, 92, 246, 0.12)',
            'transparent'
          ]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Blur Layer - Daha yüksek intensity ile yumuşatma */}
      <BlurView
        intensity={80}
        style={StyleSheet.absoluteFillObject}
        tint="dark"
      />

      {/* İçerik */}
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glow1Container: {
    position: 'absolute',
    top: '10%',
    left: '-40%',  // Daha fazla dışarıda
    width: 500,    // Daha büyük
    height: 500,
    borderRadius: 250,
    opacity: 0.4,  // Dengeli
  },
  glow2Container: {
    position: 'absolute',
    bottom: '15%',
    right: '-45%',  // Daha fazla dışarıda
    width: 550,     // Daha büyük
    height: 550,
    borderRadius: 275,
    opacity: 0.35,  // Dengeli
  },
  glow3Container: {
    position: 'absolute',
    top: '50%',
    right: '-15%',  // Daha fazla dışarıda
    width: 350,     // Daha büyük
    height: 350,
    borderRadius: 175,
    opacity: 0.38,  // Dengeli
  },
  glowGradient: {
    flex: 1,
    borderRadius: 275,
  },
  content: {
    flex: 1,
  },
});
