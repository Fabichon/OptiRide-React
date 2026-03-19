import { Linking, Platform } from 'react-native';

const PROVIDER_SCHEMES: Record<string, string> = {
  uber: 'uber://',
  bolt: 'bolt://',
  heetch: 'heetch://',
  freenow: 'freenow://',
};

const STORE_LINKS: Record<string, { ios: string; android: string }> = {
  uber: {
    ios: 'https://apps.apple.com/app/uber/id368677368',
    android: 'market://details?id=com.ubercab',
  },
  bolt: {
    ios: 'https://apps.apple.com/app/bolt/id675033630',
    android: 'market://details?id=ee.mtakso.client',
  },
  heetch: {
    ios: 'https://apps.apple.com/app/heetch/id976514223',
    android: 'market://details?id=com.heetch',
  },
  freenow: {
    ios: 'https://apps.apple.com/app/free-now/id357852748',
    android: 'market://details?id=taxi.android.client',
  },
};

export async function openProviderApp(providerId: string): Promise<boolean> {
  const scheme = PROVIDER_SCHEMES[providerId];
  if (!scheme) return false;

  const canOpen = await Linking.canOpenURL(scheme);
  if (canOpen) {
    await Linking.openURL(scheme);
    return true;
  }
  return false;
}

export async function openProviderStore(providerId: string): Promise<void> {
  const links = STORE_LINKS[providerId];
  if (!links) return;

  const url = Platform.OS === 'ios' ? links.ios : links.android;
  await Linking.openURL(url);
}

export async function openOrInstallProvider(providerId: string): Promise<void> {
  const opened = await openProviderApp(providerId);
  if (!opened) {
    await openProviderStore(providerId);
  }
}
