import { CO2_G_KM } from '../constants';
import type { HistoryEntry } from '../types';

/**
 * Calculate savings for a single ride compared to the average price.
 */
export function rideSavings(entry: HistoryEntry): number {
  return Math.max(0, entry.prixMoyen - entry.price);
}

/**
 * Calculate CO2 emissions for a ride in grams.
 */
export function rideCO2(provider: string, km: number): number {
  const gPerKm = CO2_G_KM[provider.toLowerCase()] ?? 120;
  return gPerKm * km;
}

/**
 * Calculate CO2 savings compared to the highest emitter.
 * Returns kg saved.
 */
export function rideCO2Savings(provider: string, km: number): number {
  const maxCO2 = Math.max(...Object.values(CO2_G_KM));
  const actual = rideCO2(provider, km);
  return (maxCO2 * km - actual) / 1000;
}

/**
 * Aggregate stats from history entries.
 */
export function computeHistoryStats(entries: HistoryEntry[]) {
  let totalSavings = 0;
  let totalCO2Saved = 0;

  for (const entry of entries) {
    totalSavings += rideSavings(entry);
    totalCO2Saved += rideCO2Savings(entry.provider, entry.km);
  }

  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    totalCO2Saved: Math.round(totalCO2Saved * 100) / 100,
    rideCount: entries.length,
  };
}
