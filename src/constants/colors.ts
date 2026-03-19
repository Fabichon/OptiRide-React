/**
 * Brand palette — extracted from OptiRide Figma maquette
 */
export const Colors = {
  // Primary
  teal: '#4BA8A8',
  tealLight: '#6BBFBF',
  tealSoft: '#E8F5F5',
  tealGlow: 'rgba(75,168,168,0.15)',
  tealDark: '#3A8E8E',

  // Navy
  navy: '#1A3A4A',
  navyLight: '#2C4F5F',

  // Backgrounds
  white: '#FFFFFF',
  bg: '#F6F9F9',

  // Grays
  g50: '#F4F7F7',
  g100: '#EDF2F2',
  g200: '#DDE5E5',
  g300: '#B8C8C8',
  g400: '#8FA3A3',
  g500: '#6B7F7F',
  g600: '#4A5F5F',
  g700: '#3A4F4F',
  black: '#0D1B1B',

  // Provider colors
  uber: '#000000',
  bolt: '#34D186',
  heetch: '#E84393',
  freeNow: '#E85454',

  // Semantic
  promo: '#FF9F43',
  green: '#3DAA6E',
  greenSoft: '#E8F7EE',
} as const;

export type ColorKey = keyof typeof Colors;
