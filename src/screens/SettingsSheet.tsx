import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toggle } from '../components/ui/Toggle';
import { Colors, Shadows } from '../constants';
import { useAppStore } from '../store/useAppStore';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingRowProps {
  icon: string;
  label: string;
  sub?: string;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  chevron?: boolean;
}

function SettingRow({ icon, label, sub, value, onToggle, chevron }: SettingRowProps) {
  return (
    <View style={rowStyles.container}>
      <Text style={rowStyles.icon}>{icon}</Text>
      <View style={rowStyles.info}>
        <Text style={rowStyles.label}>{label}</Text>
        {sub && <Text style={rowStyles.sub}>{sub}</Text>}
      </View>
      {onToggle && value !== undefined ? (
        <Toggle value={value} onValueChange={onToggle} />
      ) : chevron ? (
        <Text style={rowStyles.chevron}>›</Text>
      ) : null}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  icon: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.navy },
  sub: { fontSize: 12, color: Colors.g500 },
  chevron: { fontSize: 22, color: Colors.g400, fontWeight: '300' },
});

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const insets = useSafeAreaInsets();
  const preferences = useAppStore((s) => s.preferences);
  const updatePreference = useAppStore((s) => s.updatePreference);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Notifications */}
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Notifications</Text>
            <SettingRow
              icon="🔔"
              label="Notifications push"
              sub="Alertes et mises à jour"
              value={preferences.pushNotifs}
              onToggle={(v) => updatePreference('pushNotifs', v)}
            />
            <SettingRow
              icon="💰"
              label="Alertes de prix"
              sub="Sur vos trajets réguliers"
              value={preferences.prixAlertes}
              onToggle={(v) => updatePreference('prixAlertes', v)}
            />
            <SettingRow
              icon="🎉"
              label="Offres & promotions"
              sub="Bons plans des VTC"
              value={preferences.promos}
              onToggle={(v) => updatePreference('promos', v)}
            />
          </View>

          {/* Apparence */}
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Apparence</Text>
            <SettingRow
              icon="🌙"
              label="Mode sombre"
              value={preferences.modeSombre}
              onToggle={(v) => updatePreference('modeSombre', v)}
            />
          </View>

          {/* Confidentialité */}
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Confidentialité</Text>
            <SettingRow
              icon="📊"
              label="Partage anonyme"
              sub="Données anonymisées"
              value={preferences.shareAnon}
              onToggle={(v) => updatePreference('shareAnon', v)}
            />
            <SettingRow
              icon="📋"
              label="Historique des trajets"
              sub="Sauvegarder localement"
              value={preferences.historique}
              onToggle={(v) => updatePreference('historique', v)}
            />
          </View>

          {/* Langue */}
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Langue</Text>
            <SettingRow
              icon="🇫🇷"
              label="Français"
              chevron
            />
          </View>
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.g500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
