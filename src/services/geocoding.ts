import * as Location from 'expo-location';

const GOOGLE_API_KEY = 'AIzaSyBo3-1sjE-P4F_uopvde9mUK-_kG5HAbDY';

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  label: string;
  sub: string;
}

export interface PlacePrediction {
  placeId: string;
  label: string;
  sub: string;
}

/**
 * Google Places Autocomplete — returns address suggestions as user types
 */
export async function autocompleteAddress(
  query: string,
  latitude?: number,
  longitude?: number,
): Promise<PlacePrediction[]> {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      input: query,
      key: GOOGLE_API_KEY,
      language: 'fr',
      components: 'country:fr',
      types: 'geocode|establishment',
    });
    if (latitude && longitude) {
      params.set('location', `${latitude},${longitude}`);
      params.set('radius', '50000');
    }

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
    );
    const data = await res.json();

    if (data.status === 'OK' && data.predictions) {
      return data.predictions.slice(0, 5).map((p: any) => ({
        placeId: p.place_id,
        label: p.structured_formatting?.main_text || p.description,
        sub: p.structured_formatting?.secondary_text || '',
      }));
    }
  } catch {
    // Silently fall back
  }
  return [];
}

/**
 * Google Places Details — get coordinates from a place_id
 */
export async function getPlaceDetails(
  placeId: string,
): Promise<GeocodedAddress | null> {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_API_KEY,
      fields: 'geometry,formatted_address,name',
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    );
    const data = await res.json();

    if (data.status === 'OK' && data.result?.geometry?.location) {
      const loc = data.result.geometry.location;
      return {
        latitude: loc.lat,
        longitude: loc.lng,
        label: data.result.name || data.result.formatted_address || '',
        sub: data.result.formatted_address || '',
      };
    }
  } catch {
    // Silently fall back
  }
  return null;
}

/**
 * Reverse-geocode coordinates → human-readable address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ label: string; sub: string }> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const r = results[0];
      const street = r.street || r.name || '';
      const num = r.streetNumber ? `${r.streetNumber} ` : '';
      const label = street ? `${num}${street}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const parts = [r.city, r.postalCode, r.region].filter(Boolean);
      const sub = parts.join(', ') || 'France';
      return { label, sub };
    }
  } catch {
    // Silently fall back
  }
  return {
    label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    sub: 'Position sur la carte',
  };
}

/**
 * Forward-geocode address text → coordinates
 */
export async function forwardGeocode(
  address: string
): Promise<GeocodedAddress | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      const { latitude, longitude } = results[0];
      const reverse = await reverseGeocode(latitude, longitude);
      return { latitude, longitude, ...reverse };
    }
  } catch {
    // Silently fall back
  }
  return null;
}

/**
 * Request location permissions and get current position
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}
