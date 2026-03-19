import type { ProviderAccount, ProviderStatus } from '../types';

export const VTC_PROVIDERS: ProviderAccount[] = [
  { id: 'uber',    name: 'Uber',     letter: 'U', color: '#000000', desc: '',  account: 'frank@gmail.com' },
  { id: 'bolt',    name: 'Bolt',     letter: 'B', color: '#34D186', desc: '',      account: 'frank@gmail.com' },
  { id: 'heetch',  name: 'Heetch',   letter: 'H', color: '#E84393', desc: '',              account: 'frank@optiride.fr' },
  { id: 'freenow', name: 'FREE NOW', letter: 'F', color: '#E85454', desc: '',              account: 'frank@gmail.com' },
];

export const INITIAL_STATUS: Record<string, ProviderStatus> = {
  uber: 'connected',
  bolt: 'connected',
  heetch: 'disconnected',
  freenow: 'not_installed',
};
