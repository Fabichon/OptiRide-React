import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Shadows } from '../constants';

interface InviteSheetProps {
  visible: boolean;
  onClose: () => void;
}

const REFERRAL_CODE = 'FRANK-OPTI-2024';
const REFERRAL_URL = 'https://optiride.app/invite/frank42';

export function InviteSheet({ visible, onClose }: InviteSheetProps) {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins OptiRide et compare les VTC ! Utilise mon code ${REFERRAL_CODE} ou ce lien : ${REFERRAL_URL}`,
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Inviter un ami</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Partagez votre code et gagnez des avantages
          </Text>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={REFERRAL_URL}
              size={180}
              color={Colors.navy}
              backgroundColor={Colors.white}
            />
          </View>

          {/* Referral code */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Votre code parrainage</Text>
            <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
          </View>

          {/* Share button */}
          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareText}>Partager le lien</Text>
          </Pressable>
        </View>
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
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.g500,
    textAlign: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    ...Shadows.card,
  },
  codeCard: {
    backgroundColor: Colors.tealSoft,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.g500,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.teal,
    letterSpacing: 2,
  },
  shareBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    ...Shadows.glow,
  },
  shareText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
