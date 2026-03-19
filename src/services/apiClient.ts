import { useAppStore } from '../store/useAppStore';

/**
 * Centralized HTTP client for the OptiRide backend.
 *
 * All API calls go through this client which:
 * - Injects provider tokens in headers
 * - Handles errors uniformly
 * - Will handle token refresh when backend is ready
 *
 * For now the BASE_URL is empty (mock mode). Once the backend is live,
 * set it to the real endpoint (env var or config).
 */

// TODO: replace with real backend URL when infra is ready
const BASE_URL = '';

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Build auth headers from stored provider tokens.
 * The backend expects tokens as JSON in X-Provider-Tokens header.
 */
function getAuthHeaders(): Record<string, string> {
  const { providerTokens } = useAppStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Send connected provider tokens so backend can fetch real prices
  const activeTokens: Record<string, string> = {};
  for (const [providerId, token] of Object.entries(providerTokens)) {
    if (token?.accessToken) {
      activeTokens[providerId] = token.accessToken;
    }
  }

  if (Object.keys(activeTokens).length > 0) {
    headers['X-Provider-Tokens'] = JSON.stringify(activeTokens);
  }

  return headers;
}

/**
 * Check if a provider token is expired (with 60s buffer).
 */
export function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false; // no expiry = assume valid
  return Date.now() > expiresAt - 60_000;
}

/**
 * Generic fetch wrapper.
 * Returns { ok, data } on success or { ok: false, error } on failure.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  if (!BASE_URL) {
    // Mock mode — no backend available yet
    return { ok: false, error: 'API not configured (mock mode)' };
  }

  try {
    const headers = { ...getAuthHeaders(), ...(options.headers as Record<string, string>) };
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `${res.status}: ${body}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
