import { apiFetch } from './apiClient';
import { generateMockRides } from './mockRideGenerator';
import { TRIPS } from '../data';
import { useAppStore } from '../store/useAppStore';
import type { Trip, Ride } from '../types';

/**
 * Ride API service — abstraction layer between UI and data source.
 *
 * Currently falls back to mock data. When the backend is live,
 * it will call the real endpoints using provider tokens.
 *
 * Flow:
 * 1. UI calls fetchRides(origin, destination)
 * 2. This service checks if API is available
 * 3. If yes → calls backend with provider tokens → returns real JSON
 * 4. If no  → falls back to mock data generation
 */

interface FetchRidesParams {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  destLabel: string;
}

/**
 * Fetch ride comparisons from backend (or mock fallback).
 * The backend will use the user's provider tokens to query
 * Uber/Bolt/Heetch/FreeNow APIs and return a unified JSON.
 */
export async function fetchRides(params: FetchRidesParams): Promise<Trip> {
  // Try real API first
  const res = await apiFetch<Trip>('/rides/compare', {
    method: 'POST',
    body: JSON.stringify({
      origin: { lat: params.originLat, lng: params.originLng },
      destination: { lat: params.destLat, lng: params.destLng },
      label: params.destLabel,
      // Backend will read tokens from X-Provider-Tokens header
    }),
  });

  if (res.ok && res.data) {
    return res.data;
  }

  // Fallback to mock data
  return generateMockRides(params.destLat, params.destLng, params.destLabel);
}

/**
 * Fetch rides for a static/preset trip key (or dynamic).
 * Used by CompareScreen — single entry point for ride data.
 */
export async function fetchTripRides(
  tripKey: string,
): Promise<(Trip & { label?: string; address?: string }) | null> {
  const { dynamicTrip } = useAppStore.getState();

  if (tripKey === '__dynamic__') {
    if (!dynamicTrip) {
      throw new Error('Destination dynamique non définie. Veuillez choisir une destination sur la carte.');
    }
    return fetchRides({
      originLat: dynamicTrip.fromLat,
      originLng: dynamicTrip.fromLng,
      destLat: dynamicTrip.latitude,
      destLng: dynamicTrip.longitude,
      destLabel: dynamicTrip.to,
    });
  }

  // Static trip — try API, fallback to local mock
  const res = await apiFetch<Trip>(`/rides/trip/${tripKey}`);
  if (res.ok && res.data) {
    return res.data;
  }

  return TRIPS[tripKey] || null;
}

/**
 * Connect a provider account via the backend.
 * The backend handles OAuth exchange and returns the tokens.
 *
 * TODO: When backend is ready, this will:
 * 1. Open OAuth URL from backend
 * 2. Receive auth code callback
 * 3. Exchange for tokens via backend
 * 4. Store tokens in app
 *
 * For now, simulates a successful connection.
 */
export async function connectProvider(
  providerId: string,
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number; email?: string }> {
  const res = await apiFetch<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    email?: string;
  }>(`/auth/provider/${providerId}/connect`, { method: 'POST' });

  if (res.ok && res.data) {
    return res.data;
  }

  // Mock fallback — simulate token
  await new Promise((r) => setTimeout(r, 1400));
  return {
    accessToken: `mock_token_${providerId}_${Date.now()}`,
    email: 'frank@gmail.com',
  };
}

/**
 * Disconnect a provider — revokes token on backend.
 */
export async function disconnectProvider(providerId: string): Promise<void> {
  await apiFetch(`/auth/provider/${providerId}/disconnect`, { method: 'POST' });
  // Even if API fails, we clear local token (handled by caller)
}
