import { Colors } from './colors';

export interface ProviderInfo {
  id: string;
  name: string;
  letter: string;
  color: string;
  desc: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { id: 'uber', name: 'Uber', letter: 'U', color: Colors.uber, desc: '' },
  { id: 'bolt', name: 'Bolt', letter: 'B', color: Colors.bolt, desc: '' },
  { id: 'heetch', name: 'Heetch', letter: 'H', color: Colors.heetch, desc: '' },
  { id: 'freeNow', name: 'FREE NOW', letter: 'F', color: Colors.freeNow, desc: '' },
];

export const PROVIDER_MAP = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p])
) as Record<string, ProviderInfo>;

export const CO2_G_KM: Record<string, number> = {
  bolt: 85,
  uber: 118,
  heetch: 108,
  freenow: 132,
};
