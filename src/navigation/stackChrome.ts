import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {ThemeColors} from '../theme/colors';

export function stackChromeOptions({
  allowGlass,
  isDark,
  colors,
  platform,
}: {
  allowGlass: boolean;
  isDark: boolean;
  colors: ThemeColors;
  platform: string;
}): NativeStackNavigationOptions {
  const shared: NativeStackNavigationOptions = {
    headerTintColor: colors.accent,
    headerTitleStyle: {color: colors.text},
    headerBackButtonDisplayMode: 'minimal',
    headerTitleAlign: platform === 'android' ? 'left' : 'center',
    contentStyle: {backgroundColor: colors.background},
  };

  if (!allowGlass) {
    return {
      ...shared,
      headerTransparent: false,
      headerShadowVisible: true,
      headerStyle: {backgroundColor: colors.surface},
    };
  }

  return {
    ...shared,
    headerTransparent: true,
    headerShadowVisible: false,
    headerBlurEffect: isDark
      ? 'systemChromeMaterialDark'
      : 'systemChromeMaterialLight',
    scrollEdgeEffects: {
      top: 'hidden',
      bottom: 'hidden',
      left: 'hidden',
      right: 'hidden',
    },
  };
}
