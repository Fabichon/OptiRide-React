import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTokens, saveTokens } from '../services/secureTokenStore';
import type { SortMode, ProviderStatus, ProviderToken } from '../types';

interface Preferences {
  pushNotifs: boolean;
  prixAlertes: boolean;
  promos: boolean;
  modeSombre: boolean;
  carteFullMap: boolean;
  shareAnon: boolean;
  historique: boolean;
}

interface DynamicTrip {
  from: string;
  to: string;
  label: string;
  latitude: number;
  longitude: number;
  fromLat: number;
  fromLng: number;
}

interface AppState {
  // Trip
  selectedTrip: string | null;
  sortMode: SortMode;
  categoryFilter: string;
  selectedRideId: number | null;
  dynamicTrip: DynamicTrip | null;
  setSelectedTrip: (key: string | null) => void;
  setSortMode: (mode: SortMode) => void;
  setCategoryFilter: (cat: string) => void;
  setSelectedRide: (id: number | null) => void;
  setDynamicTrip: (trip: DynamicTrip | null) => void;

  // Accounts & provider tokens
  providerStatus: Record<string, ProviderStatus>;
  providerTokens: Record<string, ProviderToken>;
  setProviderStatus: (id: string, status: ProviderStatus) => void;
  setProviderToken: (id: string, token: ProviderToken | null) => void;
  removeProviderToken: (id: string) => void;
  hydrateProviderTokens: () => Promise<void>;
  getConnectedProviderIds: () => string[];

  // Preferences
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;

  // Drawer action (for communicating between drawer and home stack)
  pendingDrawerAction: string | null;
  setPendingDrawerAction: (action: string | null) => void;

  // User
  user: {
    name: string;
    email: string;
    initial: string;
  };
}

const INITIAL_PROVIDER_STATUS: Record<string, ProviderStatus> = {
  uber: 'connected',
  bolt: 'connected',
  heetch: 'disconnected',
  freenow: 'not_installed',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get): AppState => ({
      // Trip (ephemeral)
      selectedTrip: null,
      sortMode: 'cheap',
      categoryFilter: 'Tous',
      selectedRideId: null,
      dynamicTrip: null,
      setSelectedTrip: (key) => set({ selectedTrip: key, selectedRideId: null }),
      setSortMode: (mode) => set({ sortMode: mode, selectedRideId: null }),
      setCategoryFilter: (cat) => set({ categoryFilter: cat, selectedRideId: null }),
      setSelectedRide: (id) => set({ selectedRideId: id }),
      setDynamicTrip: (trip) => set({ dynamicTrip: trip }),

      // Accounts & provider tokens
      providerStatus: INITIAL_PROVIDER_STATUS,
      providerTokens: {},
      setProviderStatus: (id, status) =>
        set((state) => ({
          providerStatus: { ...state.providerStatus, [id]: status },
        })),
      setProviderToken: (id, token) => {
        set((state) => {
          const providerTokens = { ...state.providerTokens };
          if (token) {
            providerTokens[id] = token;
          } else {
            delete providerTokens[id];
          }
          // Persist to secure store (fire-and-forget)
          const serialized: Record<string, string> = {};
          Object.entries(providerTokens).forEach(([k, v]) => {
            serialized[k] = JSON.stringify(v);
          });
          saveTokens(serialized);
          return { providerTokens };
        });
      },
      removeProviderToken: (id) => {
        set((state) => {
          const providerTokens = { ...state.providerTokens };
          delete providerTokens[id];
          const serialized: Record<string, string> = {};
          Object.entries(providerTokens).forEach(([k, v]) => {
            serialized[k] = JSON.stringify(v);
          });
          saveTokens(serialized);
          return { providerTokens };
        });
      },
      hydrateProviderTokens: async () => {
        try {
          const raw = await loadTokens();
          const providerTokens: Record<string, ProviderToken> = {};
          Object.entries(raw).forEach(([k, v]) => {
            try {
              providerTokens[k] = JSON.parse(v) as ProviderToken;
            } catch {
              // Skip malformed entries
            }
          });
          set({ providerTokens });
        } catch {
          // Silently fail — start with empty tokens
        }
      },
      getConnectedProviderIds: (): string[] => {
        return Object.entries(get().providerStatus)
          .filter(([, status]) => status === 'connected')
          .map(([id]) => id);
      },

      // Preferences
      preferences: {
        pushNotifs: true,
        prixAlertes: true,
        promos: false,
        modeSombre: false,
        carteFullMap: false,
        shareAnon: false,
        historique: true,
      },
      updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      // Drawer action
      pendingDrawerAction: null,
      setPendingDrawerAction: (action: string | null) => set({ pendingDrawerAction: action }),

      // User
      user: {
        name: 'Frank',
        email: 'frank@optiride.app',
        initial: 'F',
      },
    }),
    {
      name: 'optiride-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): Partial<AppState> => ({
        providerStatus: state.providerStatus,
        preferences: state.preferences,
      }),
    }
  )
);
