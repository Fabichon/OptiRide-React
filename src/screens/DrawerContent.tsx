import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants';
import { useAppStore } from '../store/useAppStore';
import { HISTORY } from '../data';
import { computeHistoryStats } from '../services/co2Calculator';

interface DrawerContentProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const MENU_ITEMS = [
  { key: 'invite',   icon: '🎁', label: 'Inviter un ami',        sub: 'Parrainez et gagnez' },
  { key: 'settings', icon: '⚙️', label: 'Paramètres',            sub: 'Notifications, apparence…' },
  { key: 'accounts', icon: '🔗', label: 'Lier mes comptes VTC',  sub: 'Uber, Bolt, Heetch…' },
  { key: 'history',  icon: '📋', label: 'Historique des courses', sub: 'Vos trajets passés' },
];

export function DrawerContent({ onClose, onNavigate }: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const stats = computeHistoryStats(HISTORY);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.initial}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* Stats pills - no rating */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{stats.rideCount}</Text>
            <Text style={styles.statLabel}>courses</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{stats.totalSavings.toFixed(0)} €</Text>
            <Text style={styles.statLabel}>économies</Text>
          </View>
        </View>
      </View>

      {/* Menu items */}
      <ScrollView style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            style={styles.menuItem}
            onPress={() => onNavigate(item.key)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
        <Text style={styles.version}>OptiRide v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.navy,
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  email: {
    fontSize: 13,
    color: Colors.tealLight,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.tealLight,
    marginTop: 2,
  },
  menu: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuInfo: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  menuSub: {
    fontSize: 12,
    color: Colors.g500,
  },
  menuChevron: {
    fontSize: 22,
    color: Colors.g400,
    fontWeight: '300',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.freeNow,
    fontWeight: '600',
  },
  version: {
    fontSize: 11,
    color: Colors.g400,
  },
});
