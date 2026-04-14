import { useCallback, useEffect, useState } from 'react';
import { fetchTripRides } from '../services/rideApi';
import { useAppStore } from '../store/useAppStore';
import type { Trip } from '../types';

type TripWithMeta = Trip & { label?: string; address?: string };

export function useRides(tripKey: string) {
  const dynamicTrip = useAppStore((s) => s.dynamicTrip);
  const [trip, setTrip] = useState<TripWithMeta | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRides = useCallback(async () => {
    return fetchTripRides(tripKey);
  }, [tripKey, dynamicTrip]);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadRides();
        if (!cancelled) {
          setTrip(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
          setTrip(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [loadRides]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await loadRides();
      if (result) {
        setTrip(result);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement');
    } finally {
      setRefreshing(false);
    }
  }, [loadRides]);

  return { trip, refreshing, refresh, error };
}
