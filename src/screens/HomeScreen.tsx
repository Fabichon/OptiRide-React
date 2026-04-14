import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants';
import { GlassView } from '../components/ui/GlassView';
import { SUGGESTIONS_SHORT } from '../data';
import { useAppStore } from '../store/useAppStore';
import { getPlaceDetails, forwardGeocode } from '../services/geocoding';
import { TRIPS } from '../data';
import { useGeolocation, useAddressSearch } from '../hooks';
import type { PlacePrediction } from '../services/geocoding';

type SearchField = 'departure' | 'destination';

const DEFAULT_REGION = {
  latitude: 48.9478,
  longitude: 2.0686,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

const SHEET_SUGGESTIONS = SUGGESTIONS_SHORT.filter((s) => s.key !== 'carte');

// Placeholder neutre en attendant les vrais designs (icones custom a venir)
const ICON_MAP: Record<string, string> = {
  home: '⌂',
  work: '◆',
  pin: '●',
  map: '◎',
};
const iconForKey = (icon: string) => ICON_MAP[icon] || '●';

interface HomeScreenProps {
  onOpenDrawer: () => void;
  onNavigateCompare: (tripKey: string) => void;
}

export function HomeScreen({ onOpenDrawer, onNavigateCompare }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const inputRef = useRef<TextInput>(null);
  const departureInputRef = useRef<TextInput>(null);

  const setSelectedTrip = useAppStore((s) => s.setSelectedTrip);
  const setDynamicTrip = useAppStore((s) => s.setDynamicTrip);

  // ── Hooks ──
  const geo = useGeolocation(mapRef);
  const autoSearch = useAddressSearch(geo.userLocation);

  // ── Search state ──
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState<SearchField>('destination');
  const [departureQuery, setDepartureQuery] = useState('');
  const [customDeparture, setCustomDeparture] = useState<{ label: string; latitude: number; longitude: number } | null>(null);

  // ── Pulse animation ──
  const pulseScale = useSharedValue(1);
  React.useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.6, { duration: 1500 }), -1, true);
  }, [pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  // ── Recenter ──
  const handleLocateMe = useCallback(async () => {
    await geo.recenter();
  }, [geo.recenter]);

  // ── Search open / close ──
  const openSearch = useCallback(() => {
    setSearchVisible(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setSearchQuery('');
    setDepartureQuery('');
    autoSearch.clear();
    setActiveField('destination');
    Keyboard.dismiss();
  }, [autoSearch.clear]);

  // ── Field swap ──
  const handleSwapFields = useCallback(() => {
    if (!customDeparture && !searchQuery) return;
    const prevDepartureLabel = customDeparture?.label || geo.address;
    setSearchQuery(prevDepartureLabel === geo.address ? '' : prevDepartureLabel);
    setCustomDeparture(null);
    setDepartureQuery('');
  }, [customDeparture, searchQuery, geo.address]);

  // ── Search text change (debounced autocomplete) ──
  const handleSearchChange = useCallback((text: string, field: SearchField = 'destination') => {
    if (field === 'departure') setDepartureQuery(text);
    else setSearchQuery(text);
    autoSearch.search(text);
  }, [autoSearch.search]);

  // ── Autocomplete result press ──
  const handleAutoResultPress = useCallback(async (prediction: PlacePrediction) => {
    Keyboard.dismiss();
    const details = await getPlaceDetails(prediction.placeId);
    if (!details) return;

    if (activeField === 'departure') {
      setCustomDeparture({ label: prediction.label, latitude: details.latitude, longitude: details.longitude });
      setDepartureQuery('');
      autoSearch.clear();
      setActiveField('destination');
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      const departureLabel = customDeparture?.label || geo.address;
      closeSearch();
      const originCoords = customDeparture
        ? { latitude: customDeparture.latitude, longitude: customDeparture.longitude }
        : geo.userLocation || { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
      setDynamicTrip({
        from: departureLabel,
        to: prediction.label,
        label: prediction.label,
        latitude: details.latitude,
        longitude: details.longitude,
        fromLat: originCoords.latitude,
        fromLng: originCoords.longitude,
      });
      onNavigateCompare('__dynamic__');
    }
  }, [activeField, closeSearch, geo.address, customDeparture, setDynamicTrip, onNavigateCompare, autoSearch.clear]);

  // ── Suggestions filter ──
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return SUGGESTIONS_SHORT;
    const q = searchQuery.toLowerCase();
    return SUGGESTIONS_SHORT.filter(
      (s) => s.label.toLowerCase().includes(q) || (s.sub && s.sub.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleSuggestionPress = useCallback(async (key: string) => {
    if (key === 'carte') return;
    const preset = TRIPS[key];
    if (customDeparture && preset) {
      const destAddress = `${preset.address}`;
      const geocoded = await forwardGeocode(destAddress);
      if (geocoded) {
        closeSearch();
        setDynamicTrip({
          from: customDeparture.label,
          to: preset.label,
          label: preset.address,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          fromLat: customDeparture.latitude,
          fromLng: customDeparture.longitude,
        });
        onNavigateCompare('__dynamic__');
        return;
      }
    }
    setSelectedTrip(key);
    closeSearch();
    onNavigateCompare(key);
  }, [setSelectedTrip, onNavigateCompare, closeSearch, customDeparture, setDynamicTrip]);

  // ── Derived ──
  const initialRegion = geo.userLocation
    ? { ...geo.userLocation, latitudeDelta: 0.015, longitudeDelta: 0.015 }
    : DEFAULT_REGION;

  const activeQuery = activeField === 'departure' ? departureQuery : searchQuery;
  const showAutoResults = activeQuery.length >= 2 && (autoSearch.results.length > 0 || autoSearch.loading);

  return (
    <View style={styles.container}>
      {/* ═══ MAP ═══ */}
      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={initialRegion}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          zoomEnabled
          zoomTapEnabled
          zoomControlEnabled={Platform.OS === 'android'}
          scrollEnabled
          rotateEnabled
          pitchEnabled
        >
          {geo.userLocation && (
            <Marker coordinate={geo.userLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.userMarkerContainer}>
                <Animated.View style={[styles.userMarkerPulse, pulseStyle]} />
                <View style={styles.userMarkerDot} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Hamburger */}
        <Pressable style={[styles.hamburger, { top: insets.top + 10 }]} onPress={onOpenDrawer}>
          <GlassView variant="button" style={styles.hamburgerGlass}>
            <Text style={styles.hamburgerIcon}>☰</Text>
          </GlassView>
        </Pressable>

        {/* Locate me */}
        <Pressable style={styles.locateBtn} onPress={handleLocateMe}>
          <GlassView variant="button" style={styles.locateBtnGlass}>
            {geo.loading ? <ActivityIndicator size="small" color={Colors.teal} /> : <Text style={styles.locateBtnIcon}>◎</Text>}
          </GlassView>
        </Pressable>
      </View>

      {/* ═══ BOTTOM SHEET ═══ */}
      {!searchVisible && (
        <View style={[styles.sheet, { paddingBottom: insets.bottom || 12 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetContent}>
            <Pressable style={styles.searchBar} onPress={openSearch}>
              <View style={styles.searchTealDot} />
              <Text style={styles.searchPlaceholder}>Où allez-vous ?</Text>
            </Pressable>
            <Text style={styles.sectionTitle}>DESTINATIONS RÉCENTES</Text>
            {SHEET_SUGGESTIONS.map((item, index) => {
              const isFirst = index === 0;
              return (
                <Animated.View key={item.key} entering={FadeInDown.delay(index * 60).springify()}>
                  <Pressable
                    style={[styles.suggestionCard, isFirst && styles.suggestionCardHighlight]}
                    onPress={() => handleSuggestionPress(item.key)}
                  >
                    <View style={[styles.suggestionIcon, isFirst ? styles.suggestionIconHighlight : styles.suggestionIconDefault]}>
                      <Text style={[styles.suggestionEmoji, isFirst && { color: Colors.white }]}>{iconForKey(item.icon)}</Text>
                    </View>
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionLabel}>{item.label}</Text>
                    </View>
                    <Text style={[styles.suggestionChevron, isFirst && { color: Colors.teal }]}>›</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}

      {/* ═══ SEARCH OVERLAY ═══ */}
      {searchVisible && (
        <View style={[styles.searchOverlay, { paddingTop: insets.top }]}>
          <View style={styles.searchDragHandleRow}>
            <View style={styles.searchDragHandleBar} />
          </View>

          {/* Departure + Swap + Destination */}
          <View style={styles.tripFieldsContainer}>
            <Pressable
              style={[styles.departureRow, activeField === 'departure' && styles.departureRowActive]}
              onPress={() => { setActiveField('departure'); autoSearch.clear(); setTimeout(() => departureInputRef.current?.focus(), 200); }}
            >
              <View style={styles.departureDot} />
              {activeField === 'departure' ? (
                <TextInput
                  ref={departureInputRef}
                  style={styles.departureInput}
                  placeholder={customDeparture?.label || geo.address}
                  placeholderTextColor={Colors.g400}
                  value={departureQuery}
                  onChangeText={(t) => handleSearchChange(t, 'departure')}
                  autoFocus
                  returnKeyType="search"
                />
              ) : (
                <Text style={styles.departureText} numberOfLines={1}>
                  {customDeparture?.label || `${geo.address} — position actuelle`}
                </Text>
              )}
              {activeField === 'departure' && departureQuery.length > 0 && (
                <Pressable onPress={() => { setDepartureQuery(''); autoSearch.clear(); }}>
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              )}
            </Pressable>

            <View style={styles.connectorSwapContainer}>
              <View style={styles.connectorLine} />
              <Pressable style={styles.swapBtn} onPress={handleSwapFields}>
                <Text style={styles.swapIcon}>⇅</Text>
              </Pressable>
              <View style={styles.connectorLine} />
            </View>

            <View style={[styles.destinationRow, activeField === 'destination' && styles.destinationRowActive]}>
              <Text style={styles.destinationPinIcon}>📍</Text>
              <TextInput
                ref={inputRef}
                style={styles.destinationInput}
                placeholder="Entrez une destination…"
                placeholderTextColor={Colors.g400}
                value={searchQuery}
                onChangeText={(t) => handleSearchChange(t, 'destination')}
                onFocus={() => { setActiveField('destination'); autoSearch.clear(); }}
                autoFocus={activeField === 'destination'}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => { setSearchQuery(''); autoSearch.clear(); }}>
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          <Text style={styles.searchSectionTitle}>
            {showAutoResults ? 'RÉSULTATS' : 'SUGGESTIONS'}
          </Text>

          {/* Autocomplete results */}
          {showAutoResults ? (
            <FlatList
              data={autoSearch.results}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.searchListContent}
              ListHeaderComponent={autoSearch.loading && autoSearch.results.length === 0 ? (
                <View style={styles.autoLoadingRow}>
                  <ActivityIndicator size="small" color={Colors.teal} />
                  <Text style={styles.autoLoadingText}>Recherche en cours…</Text>
                </View>
              ) : null}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInUp.delay(index * 30).duration(180)}>
                  <Pressable style={styles.searchSuggestionCard} onPress={() => handleAutoResultPress(item)}>
                    <View style={styles.searchSuggestionIcon}>
                      <Text style={styles.searchSuggestionEmoji}>📍</Text>
                    </View>
                    <View style={styles.searchSuggestionInfo}>
                      <Text style={styles.searchSuggestionLabel} numberOfLines={1}>{item.label}</Text>
                      {item.sub ? <Text style={styles.searchSuggestionSub} numberOfLines={1}>{item.sub}</Text> : null}
                    </View>
                    <LinearGradient colors={[Colors.teal, '#3A8E8E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.compareBadge}>
                      <Text style={styles.compareBadgeText}>Comparer</Text>
                      <Text style={styles.compareBadgeChevron}>›</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}
            />
          ) : (
            <FlatList
              data={filteredSuggestions}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.searchListContent}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInUp.delay(index * 40).duration(200)}>
                  <Pressable
                    style={[styles.searchSuggestionCard, item.key === 'carte' && styles.searchSuggestionCardMap]}
                    onPress={() => handleSuggestionPress(item.key)}
                  >
                    <View style={[styles.searchSuggestionIcon, item.key === 'carte' && styles.searchSuggestionIconMap]}>
                      <Text style={styles.searchSuggestionEmoji}>{iconForKey(item.icon)}</Text>
                    </View>
                    <View style={styles.searchSuggestionInfo}>
                      <Text style={styles.searchSuggestionLabel}>{item.label}</Text>
                      {item.sub ? <Text style={styles.searchSuggestionSub}>{item.sub}</Text> : null}
                    </View>
                    {item.hint && (
                      <LinearGradient colors={[Colors.teal, '#3A8E8E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.compareBadge}>
                        <Text style={styles.compareBadgeText}>Comparer</Text>
                        <Text style={styles.compareBadgeChevron}>›</Text>
                      </LinearGradient>
                    )}
                    {item.key === 'carte' && <Text style={styles.searchSuggestionChevronIcon}>›</Text>}
                  </Pressable>
                </Animated.View>
              )}
            />
          )}

          {/* Close button */}
          <Pressable style={[styles.searchCloseBtn, { bottom: insets.bottom + 16 }]} onPress={closeSearch}>
            <Text style={styles.searchCloseBtnText}>Fermer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  mapArea: { flex: 1, position: 'relative' },

  // User marker
  userMarkerContainer: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  userMarkerPulse: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,122,255,0.12)' },
  userMarkerDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#007AFF', borderWidth: 4, borderColor: '#FFF', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },

  // Map buttons
  hamburger: { position: 'absolute', left: 16, zIndex: 10 },
  hamburgerGlass: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hamburgerIcon: { fontSize: 20, color: Colors.navy },
  locateBtn: { position: 'absolute', right: 16, bottom: 24, zIndex: 10 },
  locateBtnGlass: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  locateBtnIcon: { fontSize: 22, color: Colors.teal },

  // Sheet
  sheet: { backgroundColor: 'rgba(248,252,252,0.97)', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, ...Shadows.elevated },
  sheetHandle: { width: 38, height: 4.5, borderRadius: 3, backgroundColor: Colors.g300, alignSelf: 'center', marginBottom: 8 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.g200, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 16, gap: 12, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3 },
  searchTealDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.teal },
  searchPlaceholder: { fontSize: 16, color: Colors.g400, fontWeight: '500' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.g400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 2 },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.g50, borderRadius: 16, padding: 11, paddingHorizontal: 12, gap: 12, borderWidth: 1.5, borderColor: Colors.g100, marginBottom: 6 },
  suggestionCardHighlight: { backgroundColor: Colors.tealSoft, borderColor: 'rgba(75,168,168,0.3)' },
  suggestionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  suggestionIconHighlight: { backgroundColor: Colors.teal },
  suggestionIconDefault: { backgroundColor: Colors.g200 },
  suggestionEmoji: { fontSize: 18 },
  suggestionInfo: { flex: 1 },
  suggestionLabel: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  suggestionChevron: { fontSize: 18, color: Colors.g300, fontWeight: '300' },

  // Search overlay
  searchOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248,252,252,0.95)', zIndex: 100 },
  searchDragHandleRow: { alignItems: 'center', paddingVertical: 12 },
  searchDragHandleBar: { width: 38, height: 4.5, backgroundColor: 'rgba(26,58,74,0.2)', borderRadius: 3 },
  tripFieldsContainer: { paddingHorizontal: 16, paddingBottom: 14 },
  departureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(200,218,218,0.5)' },
  departureRowActive: { borderColor: '#007AFF', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.88)' },
  departureDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  departureText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.navy },
  departureInput: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.navy, padding: 0 },
  connectorSwapContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 19, paddingVertical: 2, gap: 8 },
  connectorLine: { width: 2, height: 8, backgroundColor: 'rgba(26,58,74,0.2)', borderRadius: 1 },
  swapBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.g100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.g200 },
  swapIcon: { fontSize: 14, color: Colors.navy, fontWeight: '700' },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(200,218,218,0.5)' },
  destinationRowActive: { borderColor: Colors.teal, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.88)' },
  destinationPinIcon: { fontSize: 14 },
  destinationInput: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.navy, padding: 0 },
  clearBtn: { fontSize: 16, color: Colors.g400, fontWeight: '600', paddingHorizontal: 4 },
  searchSectionTitle: { fontSize: 11, fontWeight: '700', color: 'rgba(26,58,74,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 18, marginBottom: 10 },
  searchListContent: { paddingHorizontal: 16, paddingBottom: 80, gap: 7 },
  autoLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14 },
  autoLoadingText: { fontSize: 13, color: Colors.g500, fontWeight: '500' },
  searchSuggestionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', shadowColor: 'rgba(26,58,74,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  searchSuggestionCardMap: { backgroundColor: 'rgba(255,255,255,0.4)' },
  searchSuggestionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(200,218,218,0.4)', alignItems: 'center', justifyContent: 'center' },
  searchSuggestionIconMap: { backgroundColor: 'rgba(75,168,168,0.12)' },
  searchSuggestionEmoji: { fontSize: 18 },
  searchSuggestionInfo: { flex: 1 },
  searchSuggestionLabel: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  searchSuggestionSub: { fontSize: 11, color: Colors.g500, marginTop: 1 },
  searchSuggestionChevronIcon: { fontSize: 14, color: Colors.g400, fontWeight: '300' },
  compareBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 9, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3 },
  compareBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  compareBadgeChevron: { fontSize: 12, fontWeight: '700', color: Colors.white },
  searchCloseBtn: { position: 'absolute', alignSelf: 'center', backgroundColor: Colors.navy, borderRadius: 18, paddingHorizontal: 28, paddingVertical: 12 },
  searchCloseBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
