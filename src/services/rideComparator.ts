import type { Ride, SortMode } from '../types';

export function sortByPrice(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => a.price - b.price);
}

export function sortByWaitTime(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => a.wait - b.wait);
}

export function sortRides(rides: Ride[], mode: SortMode): Ride[] {
  switch (mode) {
    case 'cheap':
      return sortByPrice(rides);
    case 'fast':
      return sortByWaitTime(rides);
  }
}

export function categorizeRide(ride: Ride): string {
  const name = ride.name.toLowerCase();
  if (name.includes('xl') || name.includes('van')) return 'XL';
  if (
    name.includes('comfort') ||
    name.includes('berline') ||
    name.includes('black') ||
    name.includes('priority') ||
    name.includes('prestige')
  )
    return 'Premium';
  if (name.includes('femme')) return 'Femme';
  return 'Standard';
}

export function filterByCategory(rides: Ride[], category: string): Ride[] {
  if (category === 'Tous') return rides;
  return rides.filter((r) => categorizeRide(r) === category);
}

/**
 * Compute a composite "OptiRide score" for ranking.
 * Weights: price 55%, wait time 45%
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return (value - min) / (max - min);
}

export function getOptiRideSelection(rides: Ride[], count: number = 3): Ride[] {
  if (rides.length <= count) return rides;

  const prices = rides.map((r) => r.price);
  const waits = rides.map((r) => r.wait);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minWait = Math.min(...waits);
  const maxWait = Math.max(...waits);

  const scored = rides.map((r) => {
    const priceScore = 1 - normalize(r.price, minPrice, maxPrice);
    const waitScore = 1 - normalize(r.wait, minWait, maxWait);

    const optiScore = priceScore * 0.55 + waitScore * 0.45;
    return { ride: r, optiScore };
  });

  return scored
    .sort((a, b) => b.optiScore - a.optiScore)
    .slice(0, count)
    .map((s) => s.ride);
}
