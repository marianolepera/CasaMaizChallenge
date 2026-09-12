import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import type {ThemeColors} from '../theme/colors';
import {colorWithAlpha} from '../theme/glass';
import {platformSurfaceStyle} from '../theme/platformSurface';

const GLASS_SURFACE_ALPHA = 0.72;
const GLASS_BORDER_ALPHA = 0.45;

export function tabChromeStyle({
  allowGlass,
  platform,
  colors,
  minTouchTarget,
}: {
  allowGlass: boolean;
  platform: string;
  colors: ThemeColors;
  minTouchTarget: number;
}): BottomTabNavigationOptions['tabBarStyle'] {
  if (allowGlass) {
    return {
      position: 'absolute',
      backgroundColor: colorWithAlpha(colors.surface, GLASS_SURFACE_ALPHA),
      borderTopColor: colorWithAlpha(colors.border, GLASS_BORDER_ALPHA),
      elevation: 0,
      minHeight: minTouchTarget,
    };
  }

  if (platform === 'android') {
    const surface = platformSurfaceStyle(platform, colors, 'chrome');
    return {
      backgroundColor: surface.backgroundColor,
      borderTopWidth: 0,
      elevation: surface.elevation,
      minHeight: minTouchTarget,
    };
  }

  return {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    minHeight: minTouchTarget,
  };
}
