import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants';
import { GlassView } from '../components/ui/GlassView';
import { RideCard } from '../components/ride/RideCard';
import { sortRides, filterByCategory } from '../services/rideComparator';
import { useAppStore } from '../store/useAppStore';
import { useRides, useSheetGesture } from '../hooks';
import type { Ride } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORIGIN = { latitude: 48.9478, longitude: 2.0686 };

const SORT_TABS = [
  { mode: 'cheap' as const, label: 'Moins cher', icon: '💰', activeColor: Colors.teal, activeBg: Colors.tealSoft },
  { mode: 'fast' as const, label: 'Plus rapide', icon: '⚡', activeColor: '#8B5CF6', activeBg: 'rgba(139,92,246,0.08)' },
];

const SORT_COLORS: Record<string, { accent: string; soft: string; light: string }> = {
  cheap: { accent: Colors.teal, soft: Colors.tealSoft, light: Colors.tealLight },
  fast:  { accent: '#8B5CF6', soft: 'rgba(139,92,246,0.08)', light: 'rgba(139,92,246,0.3)' },
};

const CATEGORIES = ['Tous', 'Standard', 'Premium', 'XL', 'Femme'];

interface CompareScreenProps {
  tripKey: string;
  onBack: () => void;
  onBookRide: (ride: Ride, tripKey: string) => void;
}

export function CompareScreen({ tripKey, onBack, onBookRide }: CompareScreenProps) {
  const insets = useSafeAreaInsets();
  const dynamicTrip = useAppStore((s) => s.dynamicTrip);
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  // ── Hooks ──
  const { trip, refreshing, refresh, error } = useRides(tripKey);
  const sheetGesture = useSheetGesture(expanded, setExpanded);

  // ── Store selectors ──
  const sortMode = useAppStore((s) => s.sortMode);
  const categoryFilter = useAppStore((s) => s.categoryFilter);
  const selectedRideId = useAppStore((s) => s.selectedRideId);
  const setSortMode = useAppStore((s) => s.setSortMode);
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter);
  const setSelectedRide = useAppStore((s) => s.setSelectedRide);

  const activeColors = SORT_COLORS[sortMode] || SORT_COLORS.cheap;

  // ── Destination coordinates ──
  const destCoord = useMemo(() => {
    if (tripKey === '__dynamic__' && dynamicTrip) {
      return { latitude: dynamicTrip.latitude, longitude: dynamicTrip.longitude };
    }
    const offsets: Record<string, { latitude: number; longitude: number }> = {
      maison: { latitude: 48.9525, longitude: 2.0620 },
      travail: { latitude: 48.8634, longitude: 2.3771 },
      gare: { latitude: 48.9462, longitude: 2.0737 },
    };
    return offsets[tripKey] || { latitude: 48.9510, longitude: 2.0750 };
  }, [tripKey, dynamicTrip]);

  // ── Animations ──
  const routeOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const sheetTranslate = useSharedValue(300);

  useEffect(() => {
    setLoading(true);
    setExpanded(false);
    setCatDropOpen(false);
    routeOpacity.value = 0;
    headerOpacity.value = 0;
    sheetTranslate.value = 300;

    const fitTimer = setTimeout(() => {
      mapRef.current?.fitToCoordinates([ORIGIN, destCoord], {
        edgePadding: { top: 140, right: 60, bottom: SCREEN_HEIGHT * 0.45, left: 60 },
        animated: true,
      });
    }, 400);

    routeOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
    headerOpacity.value = withTiming(1, { duration: 250 });
    sheetTranslate.value = withTiming(0, { duration: 250 });
    setLoading(false);

    return () => { clearTimeout(fitTimer); };
  }, [tripKey]);

  const routeStyle = useAnimatedStyle(() => ({ opacity: routeOpacity.value }));
  const headerAnimStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslate.value }] }));

  // ── Sorting & filtering ──
  const sortedAndFiltered = useMemo(() => {
    if (!trip) return [];
    return sortRides(filterByCategory(trip.rides, categoryFilter), sortMode);
  }, [trip, sortMode, categoryFilter]);


  // ── Arrival time ──
  const arrivalTime = useMemo(() => {
    if (!trip) return '';
    const mins = parseInt(trip.duration) || 10;
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    return `Arrivée ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }, [trip]);

  // Reset scroll on category change
  const prevCatRef = useRef(categoryFilter);
  useEffect(() => {
    if (prevCatRef.current !== categoryFilter) {
      prevCatRef.current = categoryFilter;
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [categoryFilter]);

  // Mirror refresh errors to toast (only when trip already loaded)
  useEffect(() => {
    if (error && trip) {
      setToastError(error);
      const t = setTimeout(() => setToastError(null), 5000);
      return () => clearTimeout(t);
    } else {
      setToastError(null);
    }
  }, [error, trip]);

  if (error && !trip) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.floatingHeader, { top: insets.top + 8 }, headerAnimStyle]}>
          <GlassView variant="panel" style={styles.floatingHeaderGlass}>
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
            <Text style={styles.headerRouteText}>Erreur</Text>
          </GlassView>
        </Animated.View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh} style={styles.errorRetryBtn}>
            <Text style={styles.errorRetryText}>Réessayer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: (ORIGIN.latitude + destCoord.latitude) / 2,
            longitude: (ORIGIN.longitude + destCoord.longitude) / 2,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          scrollEnabled={false}
          zoomEnabled={false}
        />
        <Animated.View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
          <GlassView variant="panel" style={styles.floatingHeaderGlass}>
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
            <Text style={styles.headerRouteText}>Chargement des prix…</Text>
          </GlassView>
        </Animated.View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.teal} />
        </View>
      </View>
    );
  }

  const sheetMaxHeight = expanded ? SCREEN_HEIGHT - insets.top - 100 : SCREEN_HEIGHT * 0.52;

  return (
    <View style={styles.container}>
      {/* ═══ MAP ═══ */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: (ORIGIN.latitude + destCoord.latitude) / 2,
          longitude: (ORIGIN.longitude + destCoord.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        scrollEnabled
        zoomEnabled
        zoomTapEnabled
        zoomControlEnabled={Platform.OS === 'android'}
        minZoomLevel={3}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Polyline coordinates={[ORIGIN, destCoord]} strokeColor={Colors.teal} strokeWidth={4} lineDashPattern={[0]} />
        <Marker coordinate={ORIGIN} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.departureMarker}><View style={styles.departureMarkerInner} /></View>
        </Marker>
        <Marker coordinate={destCoord} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.destMarker}><View style={styles.destMarkerInner} /></View>
        </Marker>
      </MapView>

      {/* ═══ FLOATING HEADER ═══ */}
      <Animated.View style={[styles.floatingHeader, { top: insets.top + 8 }, headerAnimStyle]}>
        <GlassView variant="panel" style={styles.floatingHeaderGlass}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerRouteInfo}>
            <View style={styles.headerRouteRow}>
              <View style={styles.headerBlueDot} />
              <Text style={styles.headerRouteText} numberOfLines={1}>{trip.from}</Text>
            </View>
            <View style={styles.headerRouteRow}>
              <Text style={styles.headerPinIcon}>📍</Text>
              <Text style={styles.headerRouteText} numberOfLines={1}>{trip.to}</Text>
            </View>
          </View>
          <View style={styles.headerChips}>
            <View style={[styles.headerChip, styles.headerChipTeal]}>
              <Text style={styles.headerChipTealText}>{trip.duration}</Text>
            </View>
            <View style={styles.headerChip}>
              <Text style={styles.headerChipText}>{arrivalTime}</Text>
            </View>
          </View>
        </GlassView>
      </Animated.View>

      {/* ═══ REFRESH ERROR TOAST ═══ */}
      {toastError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{toastError}</Text>
          <Pressable onPress={refresh}><Text style={styles.errorBannerRetry}>Réessayer</Text></Pressable>
        </View>
      )}

      {/* ═══ BOTTOM SHEET ═══ */}
      {!loading && (
        <Animated.View style={[styles.bottomSheet, expanded ? { height: sheetMaxHeight } : { maxHeight: sheetMaxHeight }, sheetStyle]}>
          {/* Drag handle */}
          <GestureDetector gesture={sheetGesture}>
            <Animated.View style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </Animated.View>
          </GestureDetector>

          {/* Sort tabs */}
          <View style={styles.sortBar}>
              <Pressable
                onPress={() => setCatDropOpen((o) => !o)}
                style={[styles.sortChip, categoryFilter !== 'Tous' && { borderColor: Colors.teal, borderWidth: 2, backgroundColor: Colors.tealSoft }]}
              >
                <Text style={[styles.sortChipLabel, categoryFilter !== 'Tous' && { color: Colors.teal }]}>
                  {categoryFilter === 'Tous' ? 'Gamme' : categoryFilter}
                </Text>
                <Text style={styles.sortChipArrow}>{catDropOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {SORT_TABS.map((tab) => (
                <Pressable
                  key={tab.mode}
                  onPress={() => setSortMode(tab.mode)}
                  style={[styles.sortChip, sortMode === tab.mode && { borderColor: tab.activeColor, borderWidth: 2, backgroundColor: tab.activeBg }]}
                >
                  <Text style={styles.sortChipIcon}>{tab.icon}</Text>
                  <Text style={[styles.sortChipLabel, sortMode === tab.mode && { color: tab.activeColor }]}>{tab.label}</Text>
                </Pressable>
              ))}

              <Pressable onPress={refresh} style={styles.sortRefreshBtn} disabled={refreshing}>
                <Text style={[styles.sortRefreshIcon, refreshing && { opacity: 0.4 }]}>{refreshing ? '...' : '↻'}</Text>
              </Pressable>
            </View>

          {/* Category dropdown */}
          {catDropOpen && expanded && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catDropdown} style={styles.catDropdownScroll}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => { setCategoryFilter(c); setCatDropOpen(false); }}
                  style={[styles.catChip, categoryFilter === c && styles.catChipActive]}
                >
                  <Text style={[styles.catChipLabel, categoryFilter === c && styles.catChipLabelActive]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Ride list */}
          <View style={styles.listContainer}>
            <FlatList
              ref={listRef}
              data={sortedAndFiltered}
              keyExtractor={(item) => `ride-${item.id}`}
              scrollEnabled={expanded}
              renderItem={({ item, index }) => (
                <View style={styles.rideCardWrapper}>
                  <RideCard
                    ride={item}
                    index={index}
                    selected={selectedRideId === item.id}
                    onPress={() => setSelectedRide(selectedRideId === item.id ? null : item.id)}
                    onBook={() => onBookRide(item, tripKey)}
                    accentColor={activeColors.accent}
                  />
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* CTA Book */}
          {selectedRideId && (
            <Animated.View entering={SlideInUp.duration(250)} style={[styles.ctaContainer, { paddingBottom: insets.bottom + 8 }]}>
              {(() => {
                const ride = sortedAndFiltered.find((r) => r.id === selectedRideId);
                if (!ride) return null;
                return (
                  <Pressable style={[styles.ctaBtn, { backgroundColor: activeColors.accent, shadowColor: activeColors.accent }]} onPress={() => onBookRide(ride, tripKey)}>
                    <Text style={styles.ctaText}>Réserver via {ride.provider}</Text>
                    <Text style={styles.ctaPrice}>{ride.price.toFixed(2).replace('.', ',')} €</Text>
                  </Pressable>
                );
              })()}
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Map markers
  departureMarker: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FFF', borderWidth: 3, borderColor: '#007AFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  departureMarkerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF' },
  destMarker: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FFF', borderWidth: 3, borderColor: '#34C759',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#34C759', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  destMarkerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },

  // Floating header
  floatingHeader: { position: 'absolute', left: 14, right: 14, zIndex: 10 },
  floatingHeaderGlass: { borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  backBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 1.5, borderColor: Colors.g200, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 15, color: Colors.navy, fontWeight: '600' },
  headerRouteInfo: { flex: 1, gap: 3 },
  headerRouteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBlueDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#007AFF' },
  headerPinIcon: { fontSize: 8 },
  headerRouteText: { fontSize: 12, fontWeight: '600', color: Colors.navy },
  headerChips: { flexDirection: 'column', gap: 4, alignItems: 'flex-end' },
  headerChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.g100 },
  headerChipTeal: { backgroundColor: Colors.tealSoft, borderWidth: 1, borderColor: `${Colors.teal}30` },
  headerChipTealText: { fontSize: 11, fontWeight: '700', color: Colors.teal },
  headerChipText: { fontSize: 11, fontWeight: '600', color: Colors.g600 },
  refreshBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.g100, borderWidth: 1, borderColor: Colors.g200, alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { fontSize: 16, color: Colors.teal, fontWeight: '700' },

  destBadge: { position: 'absolute', right: 40, zIndex: 5 },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(250,253,253,0.97)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    ...Shadows.elevated, zIndex: 20, overflow: 'hidden', flexDirection: 'column',
  },
  dragHandle: { alignItems: 'center', paddingVertical: 10, flexShrink: 0 },
  dragHandleBar: { width: 38, height: 4.5, backgroundColor: Colors.g300, borderRadius: 3 },

  // Sort bar
  sortBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 8, flexShrink: 0 },
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.g200, backgroundColor: 'rgba(255,255,255,0.82)' },
  sortChipIcon: { fontSize: 13 },
  sortChipLabel: { fontSize: 12, fontWeight: '700', color: Colors.g500 },
  sortChipArrow: { fontSize: 7, color: Colors.g400 },
  sortRefreshBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.g100, borderWidth: 1.5, borderColor: Colors.g200, alignItems: 'center', justifyContent: 'center' },
  sortRefreshIcon: { fontSize: 16, color: Colors.teal, fontWeight: '700' },

  // Category dropdown
  catDropdownScroll: { flexShrink: 0, flexGrow: 0 },
  catDropdown: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(200,218,218,0.6)', backgroundColor: 'rgba(255,255,255,0.82)' },
  catChipActive: { borderColor: Colors.teal, borderWidth: 2, backgroundColor: Colors.teal },
  catChipLabel: { fontSize: 12, fontWeight: '600', color: Colors.g600 },
  catChipLabelActive: { color: Colors.white },

  // OptiRide header (collapsed mode)
  optiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 8, marginTop: 2 },
  optiLogo: { fontSize: 14, color: Colors.teal, fontWeight: '800' },
  optiTitle: { fontSize: 11, fontWeight: '800', color: Colors.teal, letterSpacing: 0.3 },
  optiLine: { flex: 1, height: 1, backgroundColor: Colors.g200 },
  optiSeeAll: { fontSize: 10, color: Colors.g400, fontWeight: '600' },

  listContainer: { flex: 1 },
  rideCardWrapper: { paddingHorizontal: 14 },
  listContent: { paddingBottom: 16 },

  // CTA
  ctaContainer: { paddingHorizontal: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(200,218,218,0.3)' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 18, backgroundColor: Colors.teal,
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6, gap: 10,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  ctaPrice: { fontSize: 15, fontWeight: '800', color: Colors.white },

  // Loading state
  loadingContainer: { position: 'absolute', left: 0, right: 0, bottom: 100, alignItems: 'center', justifyContent: 'center' },

  // Error screen
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  errorText: { fontSize: 16, fontWeight: '600', color: Colors.navy, textAlign: 'center', marginBottom: 24 },
  errorRetryBtn: { paddingHorizontal: 28, paddingVertical: 12, backgroundColor: Colors.teal, borderRadius: 12 },
  errorRetryText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // Refresh error toast banner
  errorBanner: { position: 'absolute', top: 100, left: 14, right: 14, backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 15 },
  errorBannerText: { flex: 1, fontSize: 13, color: '#B91C1C', fontWeight: '600' },
  errorBannerRetry: { fontSize: 13, color: '#B91C1C', fontWeight: '800', textDecorationLine: 'underline', marginLeft: 10 },
});
