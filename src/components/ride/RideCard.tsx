import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProviderAvatar } from '../ui/ProviderAvatar';
import { Badge } from '../ui/Badge';
import { Colors, Shadows } from '../../constants';
import type { Ride } from '../../types';

interface RideCardProps {
  ride: Ride;
  index: number;
  selected: boolean;
  onPress: () => void;
  onBook: () => void;
  accentColor?: string;
}

export function RideCard({ ride, index, selected, onPress, onBook, accentColor }: RideCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        onPress={onPress}
        style={[styles.card, selected && [styles.cardSelected, accentColor ? { borderColor: accentColor } : undefined]]}
      >
        <ProviderAvatar letter={ride.letter} color={ride.color} size={38} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{ride.name}</Text>
            {ride.badge && <Badge label={ride.badge} />}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>👤 {ride.pax}</Text>
            <Text style={styles.detail}>  🕐 {ride.wait} min</Text>
            {ride.cash && <Text style={styles.cashBadge}>💶 Espèces</Text>}
          </View>
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.price}>{ride.price.toFixed(2)} €</Text>
          {ride.old && (
            <Text style={styles.oldPrice}>{ride.old.toFixed(2)} €</Text>
          )}
        </View>

      </Pressable>

      {/* No expanded "Ouvrir" button — booking is via the CTA at bottom of sheet */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 8,
    gap: 12,
    ...Shadows.subtle,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    fontSize: 12,
    color: Colors.g500,
  },
  cashBadge: {
    fontSize: 10,
    color: Colors.green,
    marginLeft: 6,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.g400,
    textDecorationLine: 'line-through',
  },
  expandedSection: {
    backgroundColor: Colors.tealSoft,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 18,
    ...Shadows.glow,
  },
  bookText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
