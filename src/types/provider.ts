export type ProviderStatus = 'connected' | 'disconnected' | 'not_installed';

export interface ProviderAccount {
  id: string;
  name: string;
  letter: string;
  color: string;
  desc: string;
  account?: string;
}
