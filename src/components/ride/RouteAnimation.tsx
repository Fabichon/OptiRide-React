import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteAnimationProps {
  from: string;
  to: string;
}

export function RouteAnimation({ from, to }: RouteAnimationProps) {
  const lineProgress = useSharedValue(0);
  const fromDotScale = useSharedValue(0);
  const toDotScale = useSharedValue(0);
  const fromLabelOpacity = useSharedValue(0);
  const toLabelOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Departure dot appears
    fromDotScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    fromLabelOpacity.value = withDelay(150, withTiming(1, { duration: 250 }));

    // Line draws from left to right
    lineProgress.value = withDelay(
      300,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );

    // Destination dot appears after line finishes
    toDotScale.value = withDelay(900, withSpring(1, { damping: 10, stiffness: 120 }));
    toLabelOpacity.value = withDelay(1000, withTiming(1, { duration: 250 }));

    // Pulse on destination
    pulseScale.value = withDelay(
      900,
      withTiming(2.5, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    width: lineProgress.value * (SCREEN_WIDTH - 120),
  }));

  const fromDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fromDotScale.value }],
  }));

  const toDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toDotScale.value }],
  }));

  const fromLabelStyle = useAnimatedStyle(() => ({
    opacity: fromLabelOpacity.value,
  }));

  const toLabelStyle = useAnimatedStyle(() => ({
    opacity: toLabelOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2.5 - pulseScale.value,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.searchingText}>Recherche des meilleures offres…</Text>

      <View style={styles.routeContainer}>
        {/* From dot */}
        <View style={styles.pointContainer}>
          <Animated.View style={[styles.fromDot, fromDotStyle]} />
          <Animated.Text style={[styles.pointLabel, fromLabelStyle]} numberOfLines={1}>
            {from}
          </Animated.Text>
        </View>

        {/* Animated line */}
        <View style={styles.lineTrack}>
          <Animated.View style={[styles.line, lineStyle]} />
        </View>

        {/* To dot */}
        <View style={styles.pointContainer}>
          <View style={styles.toDotWrapper}>
            <Animated.View style={[styles.toPulse, pulseStyle]} />
            <Animated.View style={[styles.toDot, toDotStyle]} />
          </View>
          <Animated.Text style={[styles.pointLabel, styles.pointLabelRight, toLabelStyle]} numberOfLines={1}>
            {to}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  searchingText: {
    fontSize: 15,
    color: Colors.g500,
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  pointContainer: {
    alignItems: 'center',
    width: 30,
  },
  fromDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  lineTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.g200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  line: {
    height: 3,
    backgroundColor: Colors.teal,
    borderRadius: 2,
  },
  toDotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.teal,
  },
  toDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.teal,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  pointLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 8,
    textAlign: 'center',
    width: 80,
  },
  pointLabelRight: {
    textAlign: 'center',
  },
});
