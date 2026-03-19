import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { ProviderAvatar } from '../components/ui/ProviderAvatar';
import { Colors, Shadows } from '../constants';
import { useAppStore } from '../store/useAppStore';
import { openOrInstallProvider } from '../services/deepLink';
import type { Ride } from '../types';

interface RedirectModalProps {
  visible: boolean;
  ride: Ride | null;
  onClose: () => void;
}

export function RedirectModal({ visible, ride, onClose }: RedirectModalProps) {
  const [dontShow, setDontShow] = useState(false);
  const setDontShowRedirect = useAppStore((s) => s.setDontShowRedirect);

  if (!ride) return null;

  const isDirect = !ride.external;

  const handleConfirm = async () => {
    if (dontShow) {
      setDontShowRedirect(ride.provider.toLowerCase());
    }
    if (ride.external) {
      await openOrInstallProvider(ride.provider.toLowerCase().replace(' ', ''));
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Provider avatar */}
          <ProviderAvatar letter={ride.letter} color={ride.color} size={56} />

          {/* Title */}
          <Text style={styles.title}>
            {isDirect
              ? `Votre course ${ride.provider} est réservée directement depuis OptiRide`
              : `Voulez-vous quitter OptiRide pour confirmer votre réservation sur ${ride.provider} ?`
            }
          </Text>

          {/* Ride recap */}
          <View style={styles.recap}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Service</Text>
              <Text style={styles.recapValue}>{ride.name}</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Prix</Text>
              <Text style={styles.recapPrice}>{ride.price.toFixed(2)} €</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Attente</Text>
              <Text style={styles.recapValue}>{ride.wait} min</Text>
            </View>
          </View>

          {/* Don't show again */}
          <Pressable
            style={styles.checkRow}
            onPress={() => setDontShow(!dontShow)}
          >
            <View style={[styles.checkbox, dontShow && styles.checkboxChecked]}>
              {dontShow && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Ne plus afficher pour {ride.provider}</Text>
          </Pressable>

          {/* Buttons */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>
              {isDirect ? 'Confirmer la réservation' : `Ouvrir ${ride.provider}`}
            </Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  recap: {
    width: '100%',
    backgroundColor: Colors.g50,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: {
    fontSize: 13,
    color: Colors.g500,
  },
  recapValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  recapPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.teal,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.g300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: 13,
    color: Colors.g500,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
    ...Shadows.glow,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.g500,
    fontWeight: '600',
  },
});
