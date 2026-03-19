export interface Ride {
  id: number;
  provider: string;
  color: string;
  letter: string;
  name: string;
  pax: string;
  wait: number;
  price: number;
  old?: number | null;
  badge?: string | null;
  external: boolean;
  cash?: boolean;
  greenScore: number;
}

export interface Trip {
  from: string;
  to: string;
  duration: string;
  distance: string;
  rides: Ride[];
}

export type TripKey = string;

export type SortMode = 'cheap' | 'fast' | 'green';

export type Category = 'Tous' | 'Standard' | 'Premium' | 'XL' | 'Femme';
