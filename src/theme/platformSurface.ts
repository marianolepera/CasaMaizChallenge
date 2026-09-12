import type {ViewStyle} from 'react-native';
import type {ThemeColors} from './colors';

export const SURFACE_LEVELS = ['card', 'banner', 'chrome'] as const;

export type SurfaceLevel = (typeof SURFACE_LEVELS)[number];

const ANDROID_ELEVATION: Record<SurfaceLevel, number> = {
  card: 1,
  banner: 2,
  chrome: 4,
};

const TONAL_SURFACE: Record<SurfaceLevel, 'surface' | 'surfaceMuted'> = {
  card: 'surface',
  banner: 'surfaceMuted',
  chrome: 'surface',
};

export function platformElevation(
  platform: string,
  level: SurfaceLevel,
): number {
  if (platform !== 'android') {
    return 0;
  }

  return ANDROID_ELEVATION[level];
}

export function platformSurfaceStyle(
  platform: string,
  colors: ThemeColors,
  level: SurfaceLevel,
): Pick<ViewStyle, 'backgroundColor' | 'borderColor' | 'borderWidth' | 'elevation'> {
  const backgroundColor = colors[TONAL_SURFACE[level]];

  if (platform === 'android') {
    return {
      backgroundColor,
      borderColor: 'transparent',
      borderWidth: 0,
      elevation: ANDROID_ELEVATION[level],
    };
  }

  return {
    backgroundColor,
    borderColor: colors.border,
    borderWidth: 1,
    elevation: 0,
  };
}
