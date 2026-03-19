import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProviderAvatarProps {
  letter: string;
  color: string;
  size?: number;
}

export function ProviderAvatar({ letter, color, size = 40 }: ProviderAvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.letter, { fontSize: size * 0.45 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
