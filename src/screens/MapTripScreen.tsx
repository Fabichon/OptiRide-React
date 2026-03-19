import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants';
import { TRIPS } from '../data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapTripScreenProps {
  tripKey: string;
  onBack: () => void;
  onCompare: () => void;
}

// Approximate coordinates for destinations (mock)
const COORDS: Record<string, { lat: number; lng: number }> = {
  maison:  { lat: 48.9510, lng: 2.0650 },
  travail: { lat: 48.8630, lng: 2.3790 },
  gare:    { lat: 48.9470, lng: 2.0640 },
};

const ORIGIN = { latitude: 48.9478, longitude: 2.0686 }; // Achères centre

export function MapTripScreen({ tripKey, onBack, onCompare }: MapTripScreenProps) {
  const insets = useSafeAreaInsets();
  const trip = TRIPS[tripKey] || TRIPS.maison;
  const dest = COORDS[tripKey] || COORDS.maison;

  const destCoord = { latitude: dest.lat, longitude: dest.lng };

  // Calculate region to fit both points
  const midLat = (ORIGIN.latitude + destCoord.latitude) / 2;
  const midLng = (ORIGIN.longitude + destCoord.longitude) / 2;
  const deltaLat = Math.abs(ORIGIN.latitude - destCoord.latitude) * 1.8 || 0.02;
  const deltaLng = Math.abs(ORIGIN.longitude - destCoord.longitude) * 1.8 || 0.02;

  return (
    <View style={styles.container}>
      {/* Header — Departure + Destination */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerRow}>
          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          {/* Trip fields */}
          <View style={styles.tripFields}>
            {/* Departure */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldDotTeal} />
              <Text style={styles.fieldText} numberOfLines={1}>Achères</Text>
            </View>
            {/* Connector */}
            <View style={styles.connectorWrap}>
              <View style={styles.connectorDot} />
            </View>
            {/* Destination */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldPinIcon}>📍</Text>
              <Text style={styles.fieldText} numberOfLines={1}>{trip.to}</Text>
            </View>
          </View>

          {/* Swap button */}
          <Pressable style={styles.swapBtn}>
            <Text style={styles.swapIcon}>⇅</Text>
          </Pressable>
        </View>
      </View>

      {/* Map with route */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: Math.max(deltaLat, 0.01),
            longitudeDelta: Math.max(deltaLng, 0.01),
          }}
          zoomEnabled={true}
          zoomTapEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          showsCompass={false}
          showsMyLocationButton={false}
        >
          {/* Origin marker */}
          <Marker coordinate={ORIGIN} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.originMarker}>
              <View style={styles.originDot} />
            </View>
          </Marker>

          {/* Destination marker */}
          <Marker coordinate={destCoord} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.destMarkerContainer}>
              <View style={styles.destMarkerHead}>
                <Text style={styles.destMarkerIcon}>📍</Text>
              </View>
              <View style={styles.destMarkerStem} />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Bottom CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Trip info */}
        <View style={styles.tripInfoRow}>
          <View style={styles.tripInfoBadge}>
            <Text style={styles.tripInfoBadgeText}>{trip.distance}</Text>
          </View>
          <View style={styles.tripInfoBadge}>
            <Text style={styles.tripInfoBadgeText}>{trip.duration}</Text>
          </View>
        </View>

        <Pressable onPress={onCompare}>
          <LinearGradient
            colors={[Colors.teal, Colors.tealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaIcon}>🔍</Text>
            <Text style={styles.ctaText}>Comparer les offres</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // --- Header ---
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.g200,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.g200,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.navy,
    fontWeight: '600',
    marginTop: -2,
  },
  tripFields: {
    flex: 1,
    gap: 0,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.g50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.g200,
  },
  fieldDotTeal: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.teal,
  },
  fieldPinIcon: {
    fontSize: 12,
  },
  fieldText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  connectorWrap: {
    paddingLeft: 18,
    paddingVertical: 1,
  },
  connectorDot: {
    width: 2,
    height: 8,
    backgroundColor: Colors.g300,
    borderRadius: 1,
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.g200,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: {
    fontSize: 18,
    color: Colors.navy,
  },

  // --- Map ---
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // --- Origin marker ---
  originMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(75,168,168,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.teal,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  // --- Destination marker ---
  destMarkerContainer: {
    alignItems: 'center',
  },
  destMarkerHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  destMarkerIcon: {
    fontSize: 18,
  },
  destMarkerStem: {
    width: 3,
    height: 10,
    backgroundColor: Colors.teal,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  // --- CTA bottom ---
  ctaContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: 'rgba(248,252,252,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    ...Shadows.elevated,
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tripInfoBadge: {
    backgroundColor: Colors.g50,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.g100,
  },
  tripInfoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaIcon: {
    fontSize: 18,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
