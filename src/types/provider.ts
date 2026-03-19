export type ProviderStatus = 'connected' | 'disconnected' | 'not_installed';

export type ProviderId = 'uber' | 'bolt' | 'heetch' | 'freenow';

export interface ProviderAccount {
  id: string;
  name: string;
  letter: string;
  color: string;
  desc: string;
  account?: string;
}

/** Token stored after OAuth / login with a VTC provider */
export interface ProviderToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // unix timestamp ms
  email?: string;     // user email from provider
}
