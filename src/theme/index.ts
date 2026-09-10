import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {darkColors, lightColors} from './colors';
import type {ThemeColors} from './colors';
import {minTouchTarget, radius, spacing} from './spacing';
import {typography} from './typography';

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  minTouchTarget: typeof minTouchTarget;
  isDark: boolean;
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      minTouchTarget,
      isDark,
    }),
    [isDark],
  );
}

export {darkColors, lightColors} from './colors';
export {minTouchTarget, radius, spacing} from './spacing';
export {typography} from './typography';
export type {ThemeColors} from './colors';
export type {TypographyVariant} from './typography';
