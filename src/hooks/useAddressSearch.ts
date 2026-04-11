import { useCallback, useRef, useState } from 'react';
import { autocompleteAddress } from '../services/geocoding';
import type { PlacePrediction } from '../services/geocoding';

export function useAddressSearch(userLocation: { latitude: number; longitude: number } | null) {
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const res = await autocompleteAddress(text, userLocation?.latitude, userLocation?.longitude);
      setResults(res);
      setLoading(false);
    }, 350);
  }, [userLocation]);

  const clear = useCallback(() => {
    setResults([]);
    setLoading(false);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { results, loading, search, clear };
}
