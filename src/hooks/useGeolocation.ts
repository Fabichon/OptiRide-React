import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { getCurrentLocation, reverseGeocode } from '../services/geocoding';

const ZOOM = { latitudeDelta: 0.015, longitudeDelta: 0.015 };

export function useGeolocation(mapRef: React.RefObject<MapView | null>) {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('Position actuelle');

  // Initial location fetch
  useEffect(() => {
    (async () => {
      setLoading(true);
      const loc = await getCurrentLocation();
      if (loc) {
        setUserLocation(loc);
        const addr = await reverseGeocode(loc.latitude, loc.longitude);
        setAddress(addr.label);
        mapRef.current?.animateToRegion({ ...loc, ...ZOOM }, 800);
      }
      setLoading(false);
    })();
  }, []);

  // Recenter to user location
  const recenter = useCallback(async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setUserLocation(loc);
      const addr = await reverseGeocode(loc.latitude, loc.longitude);
      setAddress(addr.label);
      mapRef.current?.animateToRegion({ ...loc, ...ZOOM }, 600);
    }
    setLoading(false);
  }, []);

  return { userLocation, loading, address, recenter };
}
