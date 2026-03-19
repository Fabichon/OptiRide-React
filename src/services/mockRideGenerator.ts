import { Colors } from '../constants';
import type { Ride, Trip } from '../types';

/**
 * Generate mock rides for a dynamic destination.
 * Uses distance (in km) to scale prices realistically.
 * Later this will be replaced by real API calls.
 */

const ORIGIN = { latitude: 48.9478, longitude: 2.0686 }; // Achères

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDuration(km: number): string {
  // Rough: 2 min/km in city
  const mins = Math.max(3, Math.round(km * 2.2));
  return `${mins} min`;
}

function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// Base price per km varies by provider/service
const SERVICES: Array<{
  provider: string;
  color: string;
  letter: string;
  name: string;
  pax: string;
  baseFare: number;
  perKm: number;
  waitRange: [number, number];
  external: boolean;
  cash?: boolean;
  greenScore: number;
}> = [
  { provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX',              pax: '1-4', baseFare: 2.50, perKm: 1.10, waitRange: [2, 5],   external: true,  greenScore: 62 },
  { provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Lite',           pax: '1-4', baseFare: 2.00, perKm: 0.95, waitRange: [3, 6],   external: true,  greenScore: 88 },
  { provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch Standard',     pax: '1-4', baseFare: 2.80, perKm: 1.20, waitRange: [5, 10],  external: false, cash: true, greenScore: 50 },
  { provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Priority',   pax: '1-4', baseFare: 3.00, perKm: 1.30, waitRange: [3, 7],   external: true,  greenScore: 70 },
  { provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Comfort',        pax: '1-4', baseFare: 3.50, perKm: 1.40, waitRange: [4, 8],   external: true,  greenScore: 74 },
  { provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Wait & Save',         pax: '1-4', baseFare: 1.80, perKm: 0.85, waitRange: [8, 15],  external: true,  greenScore: 95 },
  { provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Green',          pax: '1-4', baseFare: 2.20, perKm: 1.05, waitRange: [5, 10],  external: true,  greenScore: 97 },
  { provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Eco',        pax: '1-4', baseFare: 2.60, perKm: 1.15, waitRange: [6, 12],  external: true,  greenScore: 92 },
  { provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX Priority',      pax: '1-4', baseFare: 3.20, perKm: 1.35, waitRange: [2, 4],   external: true,  greenScore: 56 },
  { provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch XL',           pax: '1-6', baseFare: 4.00, perKm: 1.60, waitRange: [8, 14],  external: false, cash: true, greenScore: 42 },
  { provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Uber Comfort',        pax: '1-4', baseFare: 4.50, perKm: 1.55, waitRange: [4, 8],   external: true,  greenScore: 55 },
  { provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Taxi',       pax: '1-4', baseFare: 2.40, perKm: 1.00, waitRange: [5, 12],  external: true,  greenScore: 65 },
];

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockRides(
  destLat: number,
  destLng: number,
  destLabel: string,
): Trip & { label: string; address: string; icon: string } {
  const km = haversineKm(ORIGIN.latitude, ORIGIN.longitude, destLat, destLng);
  const roundedKm = Math.max(0.5, Math.round(km * 10) / 10);

  const rides: Ride[] = SERVICES.map((svc, i) => {
    const price = Math.round((svc.baseFare + svc.perKm * roundedKm) * 100) / 100;
    const wait = randomInRange(svc.waitRange[0], svc.waitRange[1]);
    // Some rides get an "old" (crossed out) price — ~30% chance
    const hasOld = Math.random() < 0.3;
    const old = hasOld ? Math.round(price * (1.2 + Math.random() * 0.3) * 100) / 100 : null;
    const hasBadge = hasOld && Math.random() < 0.5;

    return {
      id: i + 1,
      provider: svc.provider,
      color: svc.color,
      letter: svc.letter,
      name: svc.name,
      pax: svc.pax,
      wait,
      price,
      old,
      badge: hasBadge ? 'Promo' : null,
      external: svc.external,
      cash: svc.cash,
      greenScore: svc.greenScore,
    };
  });

  return {
    label: destLabel,
    address: destLabel,
    icon: 'pin',
    from: 'Achères centre',
    to: destLabel,
    duration: estimateDuration(roundedKm),
    distance: formatKm(roundedKm),
    rides,
  };
}
