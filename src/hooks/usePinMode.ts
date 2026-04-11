import { useCallback, useState } from 'react';
import { reverseGeocode } from '../services/geocoding';

interface PinAddress {
  label: string;
  sub: string;
}

export function usePinMode() {
  const [active, setActive] = useState(false);
  const [coord, setCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<PinAddress | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragEnd = useCallback(async (c: { latitude: number; longitude: number }) => {
    setCoord(c);
    setLoading(true);
    const addr = await reverseGeocode(c.latitude, c.longitude);
    setAddress(addr);
    setLoading(false);
  }, []);

  const enter = useCallback((center: { latitude: number; longitude: number }) => {
    setActive(true);
    setCoord(center);
    handleDragEnd(center);
  }, [handleDragEnd]);

  const exit = useCallback(() => {
    setActive(false);
    setCoord(null);
    setAddress(null);
  }, []);

  const handleMapLongPress = useCallback((e: any) => {
    const c = e.nativeEvent.coordinate;
    setActive(true);
    setCoord(c);
    handleDragEnd(c);
  }, [handleDragEnd]);

  return { active, coord, address, loading, enter, exit, handleDragEnd, handleMapLongPress };
}
