import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../../constants';
import { CATEGORIES } from '../../data';

interface CategoryFilterProps {
  active: string;
  onSelect: (cat: string) => void;
}

export const CategoryFilter = memo(function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          onPress={() => onSelect(cat)}
          style={[styles.chip, active === cat && styles.chipActive]}
        >
          <Text style={[styles.label, active === cat && styles.labelActive]}>
            {cat}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    height: 40,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.g200,
  },
  chipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  labelActive: {
    color: Colors.white,
  },
});
