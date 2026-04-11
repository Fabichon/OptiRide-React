import { useCallback, useEffect, useState } from 'react';
import { fetchTripRides } from '../services/rideApi';
import { useAppStore } from '../store/useAppStore';
import type { Trip } from '../types';

type TripWithMeta = Trip & { label?: string; address?: string };

export function useRides(tripKey: string) {
  const dynamicTrip = useAppStore((s) => s.dynamicTrip);
  const [trip, setTrip] = useState<TripWithMeta | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRides = useCallback(async () => {
    return fetchTripRides(tripKey);
  }, [tripKey, dynamicTrip]);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadRides();
      if (!cancelled) setTrip(result);
    })();
    return () => { cancelled = true; };
  }, [loadRides]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    const result = await loadRides();
    if (result) {
      setTrip((prev) => prev ? { ...prev, rides: result.rides } : result);
    }
    setRefreshing(false);
  }, [loadRides]);

  return { trip, refreshing, refresh };
}
