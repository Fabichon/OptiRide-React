import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../../constants';
import type { SortMode } from '../../types';

const TABS: { mode: SortMode; label: string; icon: string }[] = [
  { mode: 'cheap', label: 'Moins cher', icon: '💰' },
  { mode: 'fast',  label: 'Plus rapide', icon: '⚡' },
  { mode: 'green', label: 'Plus vert', icon: '🌿' },
];

interface SortTabsProps {
  active: SortMode;
  onSelect: (mode: SortMode) => void;
}

export const SortTabs = memo(function SortTabs({ active, onSelect }: SortTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.mode}
          onPress={() => onSelect(tab.mode)}
          style={[styles.tab, active === tab.mode && styles.tabActive]}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, active === tab.mode && styles.labelActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.g200,
    ...Shadows.subtle,
  },
  tabActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  icon: {
    fontSize: 14,
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
