import { Platform } from 'react-native';

export const FontFamily = Platform.select({
  ios: 'SF Pro Display',
  android: 'System',
  default: 'System',
});

export const FontWeight = {
  regular: '500' as const,
  medium: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 26,
  hero: 28,
};
