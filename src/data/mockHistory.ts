import type { HistoryEntry } from '../types';

export const HISTORY: HistoryEntry[] = [
  { id: 1,  date: "Aujourd'hui",    time: '08:14', from: 'Achères',           to: 'Gare Saint-Lazare',   provider: 'uber',    price: 7.41,  prixMoyen: 15.20, km: 32 },
  { id: 2,  date: "Aujourd'hui",    time: '00:04', from: 'Gare Saint-Lazare', to: "26 Rue d'Andrésy",    provider: 'bolt',    price: 9.20,  prixMoyen: 14.80, km: 31 },
  { id: 3,  date: 'Hier',           time: '18:42', from: 'Achères',           to: 'La Défense',          provider: 'uber',    price: 13.50, prixMoyen: 19.40, km: 22 },
  { id: 4,  date: 'Hier',           time: '07:55', from: 'Maison',            to: 'Achères RER',         provider: 'bolt',    price: 4.20,  prixMoyen: 6.90,  km: 5 },
  { id: 5,  date: 'Lun. 24 fév.',   time: '21:30', from: 'Opéra',            to: 'Achères',             provider: 'uber',    price: 24.10, prixMoyen: 30.50, km: 38 },
  { id: 6,  date: 'Lun. 24 fév.',   time: '09:05', from: 'Achères',           to: 'Cergy-Pontoise',     provider: 'bolt',    price: 11.80, prixMoyen: 16.20, km: 18 },
  { id: 7,  date: 'Dim. 23 fév.',   time: '23:15', from: 'CDG Aéroport',     to: 'Achères',             provider: 'heetch',  price: 45.00, prixMoyen: 54.50, km: 52 },
  { id: 8,  date: 'Sam. 22 fév.',   time: '14:20', from: 'Versailles',        to: 'Achères',             provider: 'uber',    price: 18.30, prixMoyen: 23.80, km: 21 },
  { id: 9,  date: 'Ven. 21 fév.',   time: '19:48', from: 'Achères',           to: 'Neuilly-sur-Seine',   provider: 'bolt',    price: 19.50, prixMoyen: 25.60, km: 29 },
  { id: 10, date: 'Jeu. 20 fév.',   time: '08:02', from: 'Achères',           to: 'La Défense',          provider: 'uber',    price: 12.90, prixMoyen: 17.30, km: 22 },
  { id: 11, date: 'Mer. 19 fév.',   time: '22:10', from: 'Châtelet',          to: 'Achères',             provider: 'freenow', price: 29.00, prixMoyen: 33.40, km: 35 },
  { id: 12, date: 'Mar. 18 fév.',   time: '07:50', from: 'Achères',           to: 'Gare Saint-Lazare',   provider: 'bolt',    price: 8.10,  prixMoyen: 13.20, km: 32 },
];
