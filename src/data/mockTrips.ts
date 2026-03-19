import { Colors } from '../constants';
import type { Trip } from '../types';

export const TRIPS: Record<string, Trip & { label: string; address: string; icon: string }> = {
  maison: {
    label: 'Maison',
    address: '12 Rue des Lilas, Achères',
    icon: 'home',
    duration: '8 min',
    distance: '2,4 km',
    from: 'Achères centre',
    to: '12 Rue des Lilas',
    rides: [
      { id: 1,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX',              pax: '1-4', wait: 3,  price: 5.20,  old: 7.40,  badge: null,    external: true,  greenScore: 62 },
      { id: 2,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Lite',           pax: '1-4', wait: 4,  price: 4.90,  old: null,  badge: null,    external: true,  greenScore: 88 },
      { id: 3,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Wait & Save',         pax: '1-4', wait: 12, price: 4.20,  old: 6.10,  badge: null,    external: true,  greenScore: 95 },
      { id: 4,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Comfort',        pax: '1-4', wait: 6,  price: 7.50,  old: null,  badge: null,    external: true,  greenScore: 74 },
      { id: 5,  provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch Standard',     pax: '1-4', wait: 8,  price: 8.00,  old: null,  badge: null,    external: false, cash: true, greenScore: 50 },
      { id: 6,  provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Priority',   pax: '1-4', wait: 5,  price: 9.50,  old: null,  badge: null,    external: true,  greenScore: 70 },
      { id: 7,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX Priority',      pax: '1-4', wait: 2,  price: 6.80,  old: 8.20,  badge: 'Promo', external: true,  greenScore: 58 },
      { id: 8,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Green',          pax: '1-4', wait: 7,  price: 6.10,  old: null,  badge: null,    external: true,  greenScore: 97 },
      { id: 9,  provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Eco',        pax: '1-4', wait: 9,  price: 7.20,  old: null,  badge: null,    external: true,  greenScore: 92 },
      { id: 10, provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Uber Comfort',        pax: '1-4', wait: 6,  price: 9.90,  old: 11.50, badge: null,    external: true,  greenScore: 55 },
      { id: 11, provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch XL',           pax: '1-6', wait: 10, price: 12.00, old: null,  badge: null,    external: false, cash: true, greenScore: 42 },
      { id: 12, provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Taxi',       pax: '1-4', wait: 14, price: 14.00, old: null,  badge: null,    external: true,  greenScore: 35 },
    ],
  },
  travail: {
    label: 'Travail',
    address: '45 Av. de la République, Paris 11e',
    icon: 'work',
    duration: '38 min',
    distance: '28 km',
    from: 'Achères centre',
    to: '45 Av. de la République',
    rides: [
      { id: 1,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX',              pax: '1-4', wait: 3,  price: 34.50, old: 42.00, badge: null,    external: true,  greenScore: 62 },
      { id: 2,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Lite',           pax: '1-4', wait: 5,  price: 29.80, old: null,  badge: null,    external: true,  greenScore: 88 },
      { id: 3,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Comfort',             pax: '1-4', wait: 7,  price: 41.20, old: 49.99, badge: 'Promo', external: true,  greenScore: 58 },
      { id: 4,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Comfort',        pax: '1-4', wait: 8,  price: 38.00, old: null,  badge: null,    external: true,  greenScore: 74 },
      { id: 5,  provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch Berline',      pax: '1-4', wait: 10, price: 45.00, old: null,  badge: null,    external: false, cash: true, greenScore: 45 },
      { id: 6,  provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Taxi',       pax: '1-4', wait: 16, price: 58.00, old: null,  badge: null,    external: true,  greenScore: 38 },
      { id: 7,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Wait & Save',         pax: '1-4', wait: 18, price: 26.40, old: 38.00, badge: null,    external: true,  greenScore: 95 },
      { id: 8,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Green',          pax: '1-4', wait: 9,  price: 31.50, old: null,  badge: null,    external: true,  greenScore: 97 },
      { id: 9,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX Priority',      pax: '1-4', wait: 4,  price: 39.90, old: 47.00, badge: 'Promo', external: true,  greenScore: 56 },
      { id: 10, provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Eco',        pax: '1-4', wait: 12, price: 33.20, old: null,  badge: null,    external: true,  greenScore: 90 },
      { id: 11, provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch XL',           pax: '1-6', wait: 14, price: 62.00, old: null,  badge: null,    external: false, cash: true, greenScore: 40 },
      { id: 12, provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Uber Black',          pax: '1-4', wait: 6,  price: 74.00, old: null,  badge: null,    external: true,  greenScore: 30 },
    ],
  },
  gare: {
    label: "Gare d'Achères",
    address: "Gare d'Achères-Ville, Achères",
    icon: 'pin',
    duration: '4 min',
    distance: '1,1 km',
    from: 'Achères centre',
    to: "Gare d'Achères-Ville",
    rides: [
      { id: 1,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX',              pax: '1-4', wait: 2,  price: 3.80,  old: 5.20,  badge: null,    external: true,  greenScore: 62 },
      { id: 2,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Lite',           pax: '1-4', wait: 3,  price: 3.50,  old: null,  badge: null,    external: true,  greenScore: 88 },
      { id: 3,  provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch Standard',     pax: '1-4', wait: 6,  price: 5.00,  old: null,  badge: null,    external: false, cash: true, greenScore: 50 },
      { id: 4,  provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Priority',   pax: '1-4', wait: 4,  price: 6.20,  old: null,  badge: null,    external: true,  greenScore: 70 },
      { id: 5,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Comfort',        pax: '1-4', wait: 5,  price: 5.90,  old: null,  badge: null,    external: true,  greenScore: 74 },
      { id: 6,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'Wait & Save',         pax: '1-4', wait: 10, price: 3.20,  old: 4.80,  badge: null,    external: true,  greenScore: 95 },
      { id: 7,  provider: 'Bolt',     color: Colors.bolt,    letter: 'B', name: 'Bolt Green',          pax: '1-4', wait: 6,  price: 4.40,  old: null,  badge: null,    external: true,  greenScore: 97 },
      { id: 8,  provider: 'FREE NOW', color: Colors.freeNow, letter: 'F', name: 'FREE NOW Eco',        pax: '1-4', wait: 8,  price: 5.50,  old: null,  badge: null,    external: true,  greenScore: 92 },
      { id: 9,  provider: 'Uber',     color: Colors.uber,    letter: 'U', name: 'UberX Priority',      pax: '1-4', wait: 2,  price: 5.10,  old: 6.40,  badge: 'Promo', external: true,  greenScore: 56 },
      { id: 10, provider: 'Heetch',   color: Colors.heetch,  letter: 'H', name: 'Heetch XL',           pax: '1-6', wait: 9,  price: 8.50,  old: null,  badge: null,    external: false, cash: true, greenScore: 42 },
    ],
  },
};

export const SUGGESTIONS_SHORT = [
  { key: 'maison',  icon: 'home', label: 'Maison',            sub: '12 Rue des Lilas, Achères',          hint: '8 min · ~5 €' },
  { key: 'travail', icon: 'work', label: 'Travail',           sub: '45 Av. de la République, Paris 11e', hint: '38 min · ~30 €' },
  { key: 'gare',    icon: 'pin',  label: "Gare d'Achères",    sub: "Gare d'Achères-Ville",               hint: '4 min · ~3,50 €' },
  { key: 'carte',   icon: 'map',  label: 'Choisir sur la carte', sub: null, hint: null },
];

export const CATEGORIES = ['Tous', 'Standard', 'Premium', 'XL', 'Femme'] as const;
