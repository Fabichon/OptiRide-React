import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Colors } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withDelay(200, withSpring(1));
    taglineOpacity.value = withDelay(600, withSpring(1));

    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('../../assets/optiride-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>Comparez. Choisissez. Roulez.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.25,
  },
  taglineContainer: {
    marginTop: 16,
  },
  tagline: {
    fontSize: 15,
    color: Colors.teal,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
