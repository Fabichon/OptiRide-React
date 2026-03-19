import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SortMode, ProviderStatus } from '../types';

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

  // Accounts
  providerStatus: Record<string, ProviderStatus>;
  setProviderStatus: (id: string, status: ProviderStatus) => void;

  // Preferences
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;

  // Drawer action (for communicating between drawer and home stack)
  pendingDrawerAction: string | null;
  setPendingDrawerAction: (action: string | null) => void;

  // Redirect
  dontShowRedirect: Record<string, boolean>;
  setDontShowRedirect: (provider: string) => void;

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
    (set) => ({
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

      // Accounts
      providerStatus: INITIAL_PROVIDER_STATUS,
      setProviderStatus: (id, status) =>
        set((state) => ({
          providerStatus: { ...state.providerStatus, [id]: status },
        })),

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
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      // Drawer action
      pendingDrawerAction: null,
      setPendingDrawerAction: (action) => set({ pendingDrawerAction: action }),

      // Redirect
      dontShowRedirect: {},
      setDontShowRedirect: (provider) =>
        set((state) => ({
          dontShowRedirect: { ...state.dontShowRedirect, [provider]: true },
        })),

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
      partialize: (state) => ({
        providerStatus: state.providerStatus,
        preferences: state.preferences,
        dontShowRedirect: state.dontShowRedirect,
      }),
    }
  )
);
