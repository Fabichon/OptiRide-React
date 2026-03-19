import type { Ride } from '../types';

export function sortByPrice(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => a.price - b.price);
}

export function sortByWaitTime(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => a.wait - b.wait);
}

export function sortByGreenScore(rides: Ride[]): Ride[] {
  return [...rides].sort((a, b) => b.greenScore - a.greenScore);
}

export function sortRides(rides: Ride[], mode: 'cheap' | 'fast' | 'green'): Ride[] {
  switch (mode) {
    case 'cheap':
      return sortByPrice(rides);
    case 'fast':
      return sortByWaitTime(rides);
    case 'green':
      return sortByGreenScore(rides);
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
 * Weights: price 40%, wait time 30%, green score 30%
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return (value - min) / (max - min);
}

export function getOptiRideSelection(rides: Ride[], count: number = 3): Ride[] {
  if (rides.length <= count) return rides;

  const prices = rides.map((r) => r.price);
  const waits = rides.map((r) => r.wait);
  const greens = rides.map((r) => r.greenScore);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minWait = Math.min(...waits);
  const maxWait = Math.max(...waits);
  const minGreen = Math.min(...greens);
  const maxGreen = Math.max(...greens);

  const scored = rides.map((r) => {
    // Lower price is better (invert)
    const priceScore = 1 - normalize(r.price, minPrice, maxPrice);
    // Lower wait is better (invert)
    const waitScore = 1 - normalize(r.wait, minWait, maxWait);
    // Higher green is better
    const greenScoreNorm = normalize(r.greenScore, minGreen, maxGreen);

    const optiScore = priceScore * 0.4 + waitScore * 0.3 + greenScoreNorm * 0.3;
    return { ride: r, optiScore };
  });

  return scored
    .sort((a, b) => b.optiScore - a.optiScore)
    .slice(0, count)
    .map((s) => s.ride);
}
