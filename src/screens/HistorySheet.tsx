import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProviderAvatar } from '../components/ui/ProviderAvatar';
import { Colors, Shadows } from '../constants';
import { HISTORY } from '../data';
import { computeHistoryStats, rideSavings, rideCO2Savings } from '../services/co2Calculator';

const PROVIDER_META: Record<string, { letter: string; color: string }> = {
  uber:    { letter: 'U', color: '#000000' },
  bolt:    { letter: 'B', color: '#34D186' },
  heetch:  { letter: 'H', color: '#E84393' },
  freenow: { letter: 'F', color: '#E85454' },
};

interface HistorySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function HistorySheet({ visible, onClose }: HistorySheetProps) {
  const insets = useSafeAreaInsets();
  const stats = computeHistoryStats(HISTORY);

  // Group by date
  const grouped: Record<string, typeof HISTORY> = {};
  for (const entry of HISTORY) {
    if (!grouped[entry.date]) grouped[entry.date] = [];
    grouped[entry.date].push(entry);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Historique</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.greenSoft }]}>
            <Text style={[styles.summaryValue, { color: Colors.green }]}>{stats.totalSavings.toFixed(2)} €</Text>
            <Text style={styles.summaryLabel}>Économisé</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.tealSoft }]}>
            <Text style={[styles.summaryValue, { color: Colors.teal }]}>{stats.totalCO2Saved.toFixed(1)} kg</Text>
            <Text style={styles.summaryLabel}>CO₂ évité</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.g50 }]}>
            <Text style={[styles.summaryValue, { color: Colors.navy }]}>{stats.rideCount}</Text>
            <Text style={styles.summaryLabel}>Courses</Text>
          </View>
        </View>

        {/* Ride list */}
        <ScrollView contentContainerStyle={styles.listContent}>
          {Object.entries(grouped).map(([date, entries]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {entries.map((entry) => {
                const meta = PROVIDER_META[entry.provider] || { letter: '?', color: Colors.g400 };
                const saved = rideSavings(entry);
                const co2 = rideCO2Savings(entry.provider, entry.km);

                return (
                  <View key={entry.id} style={styles.card}>
                    <ProviderAvatar letter={meta.letter} color={meta.color} size={38} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardRoute}>{entry.from} → {entry.to}</Text>
                      <Text style={styles.cardTime}>{entry.time} · {entry.km} km</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.cardPrice}>{entry.price.toFixed(2)} €</Text>
                      {saved > 0 && (
                        <Text style={styles.savedBadge}>-{saved.toFixed(2)} €</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.navy,
  },
  closeBtn: {
    fontSize: 22,
    color: Colors.g500,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.g500,
    marginTop: 4,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.g500,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    ...Shadows.subtle,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  cardTime: {
    fontSize: 12,
    color: Colors.g500,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  savedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
    backgroundColor: Colors.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
