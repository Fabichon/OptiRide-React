import * as SecureStore from 'expo-secure-store';

const KEY = 'optiride.provider_tokens';

export async function loadTokens(): Promise<Record<string, string>> {
  try {
    const available = await SecureStore.isAvailableAsync();
    if (!available) return {};
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function saveTokens(tokens: Record<string, string>): Promise<void> {
  try {
    const available = await SecureStore.isAvailableAsync();
    if (!available) return;
    await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
  } catch {
    // Silently fail — tokens remain in-memory
  }
}

export async function clearTokens(): Promise<void> {
  try {
    const available = await SecureStore.isAvailableAsync();
    if (!available) return;
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Silently fail
  }
}
