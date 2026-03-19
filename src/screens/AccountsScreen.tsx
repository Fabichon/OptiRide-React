import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProviderAvatar } from '../components/ui/ProviderAvatar';
import { Colors, Shadows } from '../constants';
import { VTC_PROVIDERS } from '../data';
import { useAppStore } from '../store/useAppStore';
import { openProviderStore } from '../services/deepLink';
import { connectProvider, disconnectProvider } from '../services/rideApi';
import type { ProviderStatus } from '../types';

interface AccountsScreenProps {
  onBack: () => void;
}

export function AccountsScreen({ onBack }: AccountsScreenProps) {
  const insets = useSafeAreaInsets();
  const providerStatus = useAppStore((s) => s.providerStatus);
  const setProviderStatus = useAppStore((s) => s.setProviderStatus);
  const setProviderToken = useAppStore((s) => s.setProviderToken);
  const providerTokens = useAppStore((s) => s.providerTokens);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Fallback: if provider id not in store (e.g. persisted data mismatch), treat as not_installed
  const getStatus = (id: string): ProviderStatus => providerStatus[id] ?? 'not_installed';
  const connected = VTC_PROVIDERS.filter((p) => getStatus(p.id) === 'connected');
  const disconnected = VTC_PROVIDERS.filter((p) => getStatus(p.id) === 'disconnected');
  const notInstalled = VTC_PROVIDERS.filter((p) => getStatus(p.id) === 'not_installed');

  const connectedCount = connected.length;

  const handleConnect = async (id: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      // Calls backend OAuth flow (or mock fallback for now)
      const tokenData = await connectProvider(id);
      setProviderToken(id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        email: tokenData.email,
      });
      setProviderStatus(id, 'connected');
    } catch {
      Alert.alert('Erreur', 'Impossible de connecter ce compte. Réessayez.');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDisconnect = (id: string, name: string) => {
    Alert.alert(
      'Déconnecter',
      `Voulez-vous déconnecter votre compte ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            setLoading((prev) => ({ ...prev, [id]: true }));
            try {
              await disconnectProvider(id);
            } finally {
              // Clear token & status even if API fails
              setProviderToken(id, null);
              setProviderStatus(id, 'disconnected');
              setLoading((prev) => ({ ...prev, [id]: false }));
            }
          },
        },
      ]
    );
  };

  const handleInstall = (id: string) => {
    openProviderStore(id);
  };

  const renderCard = (provider: typeof VTC_PROVIDERS[0], status: ProviderStatus) => (
    <View key={provider.id} style={styles.card}>
      <ProviderAvatar letter={provider.letter} color={provider.color} size={44} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{provider.name}</Text>
        {status === 'connected' && (providerTokens[provider.id]?.email || provider.account) && (
          <Text style={styles.cardEmail}>{providerTokens[provider.id]?.email || provider.account}</Text>
        )}
      </View>
      {loading[provider.id] ? (
        <ActivityIndicator color={Colors.teal} />
      ) : status === 'connected' ? (
        <Pressable
          style={styles.disconnectBtn}
          onPress={() => handleDisconnect(provider.id, provider.name)}
        >
          <Text style={styles.disconnectText}>Déconnecter</Text>
        </Pressable>
      ) : status === 'disconnected' ? (
        <Pressable
          style={styles.connectBtn}
          onPress={() => handleConnect(provider.id)}
        >
          <Text style={styles.connectText}>Se connecter</Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.installBtn}
          onPress={() => handleInstall(provider.id)}
        >
          <Text style={styles.installText}>Installer</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Lier mes comptes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Pourquoi lier vos comptes ?</Text>
          <Text style={styles.heroText}>
            Liez vos comptes VTC pour comparer les prix en temps réel et réserver directement depuis OptiRide.
          </Text>
        </View>

        {connected.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Comptes connectés</Text>
            {connected.map((p) => renderCard(p, 'connected'))}
          </>
        )}

        {disconnected.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Non connectés</Text>
            {disconnected.map((p) => renderCard(p, 'disconnected'))}
          </>
        )}

        {notInstalled.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Non installés</Text>
            {notInstalled.map((p) => renderCard(p, 'not_installed'))}
          </>
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.g100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    color: Colors.navy,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  countBadge: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: Colors.tealSoft,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.teal,
    marginBottom: 6,
  },
  heroText: {
    fontSize: 13,
    color: Colors.g600,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.g500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    ...Shadows.subtle,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.g500,
  },
  cardEmail: {
    fontSize: 11,
    color: Colors.teal,
    marginTop: 2,
  },
  connectBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  connectText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  disconnectBtn: {
    backgroundColor: Colors.g100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disconnectText: {
    color: Colors.g600,
    fontSize: 13,
    fontWeight: '600',
  },
  installBtn: {
    backgroundColor: Colors.g50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.g200,
  },
  installText: {
    color: Colors.g500,
    fontSize: 13,
    fontWeight: '600',
  },
});
