import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  SlideInUp,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants';
import { GlassView } from '../components/ui/GlassView';
import { OptiRideSelection } from '../components/ride/OptiRideSelection';
import { RideCard } from '../components/ride/RideCard';
import { sortRides, filterByCategory, getOptiRideSelection } from '../services/rideComparator';
import { fetchTripRides } from '../services/rideApi';
import { useAppStore } from '../store/useAppStore';
import type { Ride, Trip } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORIGIN = { latitude: 48.9478, longitude: 2.0686 };

const SORT_TABS = [
  { mode: 'cheap' as const, label: 'Moins cher', icon: '💰', activeColor: Colors.teal, activeBg: Colors.tealSoft },
  { mode: 'fast' as const, label: 'Plus rapide', icon: '⚡', activeColor: '#8B5CF6', activeBg: 'rgba(139,92,246,0.08)' },
  { mode: 'green' as const, label: 'Plus vert', icon: '🌿', activeColor: Colors.green, activeBg: Colors.greenSoft },
];

const SORT_COLORS: Record<string, { accent: string; soft: string; light: string }> = {
  cheap: { accent: Colors.teal, soft: Colors.tealSoft, light: Colors.tealLight },
  fast:  { accent: '#8B5CF6', soft: 'rgba(139,92,246,0.08)', light: 'rgba(139,92,246,0.3)' },
  green: { accent: Colors.green, soft: Colors.greenSoft, light: 'rgba(61,170,110,0.3)' },
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
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [trip, setTrip] = useState<(Trip & { label?: string; address?: string }) | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch rides via API service (falls back to mock if backend unavailable)
  const loadRides = useCallback(async () => {
    const result = await fetchTripRides(tripKey);
    return result;
  }, [tripKey, dynamicTrip]);

  // Initial fetch only (no auto-refresh — user triggers refresh manually)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadRides();
      if (!cancelled) setTrip(result);
    })();
    return () => { cancelled = true; };
  }, [loadRides]);

  // Manual refresh triggered by user
  const handleRefreshPrices = useCallback(async () => {
    setRefreshing(true);
    const result = await loadRides();
    if (result) {
      setTrip((prev) => {
        if (!prev) return result;
        return { ...prev, rides: result.rides };
      });
    }
    setRefreshing(false);
  }, [loadRides]);

  const sortMode = useAppStore((s) => s.sortMode);
  const categoryFilter = useAppStore((s) => s.categoryFilter);
  const selectedRideId = useAppStore((s) => s.selectedRideId);
  const setSortMode = useAppStore((s) => s.setSortMode);
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter);
  const setSelectedRide = useAppStore((s) => s.setSelectedRide);

  const activeColors = SORT_COLORS[sortMode] || SORT_COLORS.cheap;

  // Destination coordinates
  const destCoord = useMemo(() => {
    if (tripKey === '__dynamic__' && dynamicTrip) {
      return { latitude: dynamicTrip.latitude, longitude: dynamicTrip.longitude };
    }
    // Approximate coords for static trips
    const offsets: Record<string, { latitude: number; longitude: number }> = {
      maison: { latitude: 48.9525, longitude: 2.0620 },
      travail: { latitude: 48.8634, longitude: 2.3771 },
      gare: { latitude: 48.9462, longitude: 2.0737 },
    };
    return offsets[tripKey] || { latitude: 48.9510, longitude: 2.0750 };
  }, [tripKey, dynamicTrip]);

  // Route line animation
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

    // Fit map to show both points
    setTimeout(() => {
      mapRef.current?.fitToCoordinates([ORIGIN, destCoord], {
        edgePadding: { top: 140, right: 60, bottom: SCREEN_HEIGHT * 0.45, left: 60 },
        animated: true,
      });
    }, 400);

    // Animate route line appearing
    routeOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    headerOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    // Show bottom sheet after route animation
    const timer = setTimeout(() => {
      setLoading(false);
      sheetTranslate.value = withSpring(0, { damping: 18, stiffness: 120 });
    }, 1600);
    return () => clearTimeout(timer);
  }, [tripKey]);

  const routeStyle = useAnimatedStyle(() => ({ opacity: routeOpacity.value }));
  const headerAnimStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslate.value }] }));

  const sortedAndFiltered = useMemo(() => {
    if (!trip) return [];
    const filtered = filterByCategory(trip.rides, categoryFilter);
    return sortRides(filtered, sortMode);
  }, [trip, sortMode, categoryFilter]);

  const optiSelection = useMemo(() => getOptiRideSelection(sortedAndFiltered, 3), [sortedAndFiltered]);
  const remainingRides = useMemo(() => {
    const optiIds = new Set(optiSelection.map((r) => r.id));
    return sortedAndFiltered.filter((r) => !optiIds.has(r.id));
  }, [sortedAndFiltered, optiSelection]);

  // Arrival time estimation
  const arrivalTime = useMemo(() => {
    if (!trip) return '';
    const mins = parseInt(trip.duration) || 10;
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    return `Arrivée ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }, [trip]);

  const prevCatRef = useRef(categoryFilter);
  useEffect(() => {
    if (prevCatRef.current !== categoryFilter) {
      prevCatRef.current = categoryFilter;
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [categoryFilter]);

  // Pan gesture for bottom sheet drag handle — swipe up to expand, down to collapse
  const dragGesture = useMemo(() =>
    Gesture.Pan()
      .onEnd((e) => {
        if (e.translationY < -40) {
          runOnJS(setExpanded)(true);
        } else if (e.translationY > 40) {
          runOnJS(setExpanded)(false);
        }
      }),
    []
  );

  // Tap gesture to toggle expansion
  const tapGesture = useMemo(() =>
    Gesture.Tap()
      .onEnd(() => {
        runOnJS(setExpanded)(!expanded);
      }),
    [expanded]
  );

  const composedGesture = useMemo(() => Gesture.Race(dragGesture, tapGesture), [dragGesture, tapGesture]);

  if (!trip) return null;

  const sheetMaxHeight = expanded ? SCREEN_HEIGHT - insets.top - 100 : SCREEN_HEIGHT * 0.52;

  return (
    <View style={styles.container}>
      {/* ═══ MAP BACKGROUND ═══ */}
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
        scrollEnabled={true}
        zoomEnabled={true}
        zoomTapEnabled={true}
        zoomControlEnabled={Platform.OS === 'android'}
        minZoomLevel={3}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Route polyline */}
        <Polyline
          coordinates={[ORIGIN, destCoord]}
          strokeColor={Colors.teal}
          strokeWidth={4}
          lineDashPattern={[0]}
        />

        {/* Departure marker */}
        <Marker coordinate={ORIGIN} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.departureMarker}>
            <View style={styles.departureMarkerInner} />
          </View>
        </Marker>

        {/* Destination marker */}
        <Marker coordinate={destCoord} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.destMarker}>
            <View style={styles.destMarkerInner} />
          </View>
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
          <Pressable onPress={handleRefreshPrices} style={styles.refreshBtn} disabled={refreshing}>
            <Text style={[styles.refreshIcon, refreshing && { opacity: 0.4 }]}>{refreshing ? '⟳' : '↻'}</Text>
          </Pressable>
        </GlassView>
      </Animated.View>

      {/* Destination badge on map */}
      {!loading && (
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={[styles.destBadge, { top: insets.top + 90 }]}>
          {/* This floats over the map — positioned by fitToCoordinates */}
        </Animated.View>
      )}

      {/* ═══ BOTTOM SHEET ═══ */}
      {!loading && (
        <Animated.View style={[styles.bottomSheet, expanded ? { height: sheetMaxHeight } : { maxHeight: sheetMaxHeight }, sheetStyle]}>
          {/* Drag handle — swipe up/down or tap to toggle */}
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </Animated.View>
          </GestureDetector>

          {/* Sort tabs — only when expanded */}
          {expanded && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortBar}
              style={styles.sortBarScroll}
            >
              {/* Category dropdown */}
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
                  style={[
                    styles.sortChip,
                    sortMode === tab.mode && {
                      borderColor: tab.activeColor,
                      borderWidth: 2,
                      backgroundColor: tab.activeBg,
                    },
                  ]}
                >
                  <Text style={styles.sortChipIcon}>{tab.icon}</Text>
                  <Text style={[styles.sortChipLabel, sortMode === tab.mode && { color: tab.activeColor }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Category dropdown — scrollable chips */}
          {expanded && catDropOpen && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catDropdown}
              style={styles.catDropdownScroll}
            >
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

          {/* Ride list — flex: 1 so it fills remaining space and scrolls */}
          <View style={styles.listContainer}>
            <FlatList
              ref={listRef}
              data={expanded ? sortedAndFiltered : []}
              keyExtractor={(item) => `ride-${item.id}`}
              scrollEnabled={expanded}
              ListHeaderComponent={
                !expanded ? (
                  <>
                    {/* Collapsed: OptiRide picks */}
                    <View style={styles.optiHeader}>
                      <Text style={[styles.optiLogo, { color: activeColors.accent }]}>◎</Text>
                      <Text style={[styles.optiTitle, { color: activeColors.accent }]}>SÉLECTION OPTIRIDE</Text>
                      <View style={styles.optiLine} />
                      <Pressable onPress={() => setExpanded(true)}>
                        <Text style={styles.optiSeeAll}>Tout voir ↑</Text>
                      </Pressable>
                    </View>
                    <OptiRideSelection
                      rides={optiSelection}
                      selectedId={selectedRideId}
                      onSelect={(id) => setSelectedRide(selectedRideId === id ? null : id)}
                      onBook={(ride) => onBookRide(ride, tripKey)}
                      accentColor={activeColors.accent}
                      accentSoft={activeColors.soft}
                      accentLight={activeColors.light}
                    />
                  </>
                ) : null
              }
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
                const ride = sortedAndFiltered.find((r) => r.id === selectedRideId) || optiSelection.find((r) => r.id === selectedRideId);
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
  floatingHeaderGlass: {
    borderRadius: 20, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, gap: 10,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 9,
    borderWidth: 1.5, borderColor: Colors.g200,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
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
    ...Shadows.elevated,
    zIndex: 20,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  dragHandle: { alignItems: 'center', paddingVertical: 10, flexShrink: 0 },
  dragHandleBar: { width: 38, height: 4.5, backgroundColor: Colors.g300, borderRadius: 3 },

  // Sort bar
  sortBarScroll: { flexShrink: 0, flexGrow: 0 },
  sortBar: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 14, paddingBottom: 8,
  },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 16, borderWidth: 1.5, borderColor: Colors.g200,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  sortChipIcon: { fontSize: 13 },
  sortChipLabel: { fontSize: 12, fontWeight: '700', color: Colors.g500 },
  sortChipArrow: { fontSize: 7, color: Colors.g400 },

  // Category dropdown
  catDropdownScroll: { flexShrink: 0, flexGrow: 0 },
  catDropdown: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 14, paddingBottom: 8,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(200,218,218,0.6)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  catChipActive: { borderColor: Colors.teal, borderWidth: 2, backgroundColor: Colors.teal },
  catChipLabel: { fontSize: 12, fontWeight: '600', color: Colors.g600 },
  catChipLabelActive: { color: Colors.white },

  // OptiRide header (collapsed mode)
  optiHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, marginBottom: 8, marginTop: 2,
  },
  optiLogo: { fontSize: 14, color: Colors.teal, fontWeight: '800' },
  optiTitle: { fontSize: 11, fontWeight: '800', color: Colors.teal, letterSpacing: 0.3 },
  optiLine: { flex: 1, height: 1, backgroundColor: Colors.g200 },
  optiSeeAll: { fontSize: 10, color: Colors.g400, fontWeight: '600' },

  listContainer: { flex: 1 },
  rideCardWrapper: { paddingHorizontal: 14 },
  listContent: { paddingBottom: 16 },

  // CTA
  ctaContainer: {
    paddingHorizontal: 14, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(200,218,218,0.3)',
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 18,
    backgroundColor: Colors.teal,
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6,
    gap: 10,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  ctaPrice: { fontSize: 15, fontWeight: '800', color: Colors.white },
});
