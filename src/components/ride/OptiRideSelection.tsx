import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RideCard } from './RideCard';
import { Colors, Shadows } from '../../constants';
import type { Ride } from '../../types';

interface OptiRideSelectionProps {
  rides: Ride[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onBook: (ride: Ride) => void;
}

export function OptiRideSelection({ rides, selectedId, onSelect, onBook }: OptiRideSelectionProps) {
  if (rides.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sélection OptiRide</Text>
        <Text style={styles.subtitle}>Top 3 recommandés</Text>
      </View>
      {rides.map((ride, index) => (
        <RideCard
          key={ride.id}
          ride={ride}
          index={index}
          selected={selectedId === ride.id}
          onPress={() => onSelect(ride.id)}
          onBook={() => onBook(ride)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: Colors.tealSoft,
    borderWidth: 1,
    borderColor: Colors.tealLight,
    ...Shadows.subtle,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.teal,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.g500,
    marginTop: 2,
  },
});
