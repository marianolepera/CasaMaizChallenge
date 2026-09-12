import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import type {ThemeColors} from '../theme/colors';
import {colorWithAlpha} from '../theme/glass';

const GLASS_SURFACE_ALPHA = 0.72;
const GLASS_BORDER_ALPHA = 0.45;

export function tabChromeStyle({
  allowGlass,
  colors,
  minTouchTarget,
}: {
  allowGlass: boolean;
  colors: ThemeColors;
  minTouchTarget: number;
}): BottomTabNavigationOptions['tabBarStyle'] {
  if (!allowGlass) {
    return {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      minHeight: minTouchTarget,
    };
  }

  return {
    position: 'absolute',
    backgroundColor: colorWithAlpha(colors.surface, GLASS_SURFACE_ALPHA),
    borderTopColor: colorWithAlpha(colors.border, GLASS_BORDER_ALPHA),
    elevation: 0,
    minHeight: minTouchTarget,
  };
}
