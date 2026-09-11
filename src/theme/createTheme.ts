import {DarkTheme, DefaultTheme, type Theme as NavigationTheme} from '@react-navigation/native';
import type {ThemeColors} from './colors';
import {darkColors, lightColors} from './colors';
import {minTouchTarget, radius, spacing} from './spacing';
import {typography} from './typography';
import type {AppearancePreference} from './appearance';

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  minTouchTarget: typeof minTouchTarget;
  isDark: boolean;
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
  navigationTheme: NavigationTheme;
};

const noopSetPreference = (_preference: AppearancePreference) => undefined;

export function createTheme({
  isDark,
  preference,
  setPreference = noopSetPreference,
}: {
  isDark: boolean;
  preference: AppearancePreference;
  setPreference?: (preference: AppearancePreference) => void;
}): Theme {
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    spacing,
    radius,
    typography,
    minTouchTarget,
    isDark,
    preference,
    setPreference,
    navigationTheme: toNavigationTheme(colors, isDark),
  };
}

export function toNavigationTheme(
  colors: ThemeColors,
  isDark: boolean,
): NavigationTheme {
  const base = isDark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}
