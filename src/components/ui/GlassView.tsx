import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: 'panel' | 'button' | 'chip' | 'dark';
}

const VARIANTS = {
  panel: {
    bg: 'rgba(255,255,255,0.88)',
    intensity: 40,
    borderColor: 'rgba(255,255,255,0.6)',
    tint: 'light' as const,
    shine: true,
  },
  button: {
    bg: 'rgba(255,255,255,0.78)',
    intensity: 28,
    borderColor: 'rgba(255,255,255,0.8)',
    tint: 'light' as const,
    shine: true,
  },
  chip: {
    bg: 'rgba(255,255,255,0.75)',
    intensity: 20,
    borderColor: 'rgba(200,218,218,0.5)',
    tint: 'light' as const,
    shine: false,
  },
  dark: {
    bg: 'rgba(20,50,64,0.90)',
    intensity: 40,
    borderColor: 'rgba(255,255,255,0.08)',
    tint: 'dark' as const,
    shine: true,
  },
};

export function GlassView({ children, style, intensity, variant = 'panel' }: GlassViewProps) {
  const v = VARIANTS[variant];
  const blurIntensity = intensity ?? v.intensity;

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={blurIntensity} tint={v.tint} style={[styles.container, style]}>
        <View style={[styles.overlay, { backgroundColor: v.bg, borderColor: v.borderColor }]}>
          {v.shine && (
            <LinearGradient
              colors={
                variant === 'dark'
                  ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']
                  : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']
              }
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.shine}
              pointerEvents="none"
            />
          )}
          {children}
        </View>
      </BlurView>
    );
  }

  // Android: solid background + subtle gradient shine
  return (
    <View style={[styles.container, styles.overlay, { backgroundColor: v.bg, borderColor: v.borderColor }, style]}>
      {v.shine && (
        <LinearGradient
          colors={
            variant === 'dark'
              ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']
          }
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.shine}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    borderWidth: 1,
  },
  shine: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
