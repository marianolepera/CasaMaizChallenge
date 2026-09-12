import {darkColors, lightColors} from '../theme/colors';
import {stackChromeOptions} from '../navigation/stackChrome';

describe('stack chrome', () => {
  it('uses the native iOS material blur when glass is allowed', () => {
    expect(
      stackChromeOptions({
        allowGlass: true,
        isDark: false,
        colors: lightColors,
      }),
    ).toMatchObject({
      headerTransparent: true,
      headerShadowVisible: false,
      headerBlurEffect: 'systemChromeMaterialLight',
      headerTintColor: lightColors.accent,
      scrollEdgeEffects: {
        top: 'hidden',
        bottom: 'hidden',
        left: 'hidden',
        right: 'hidden',
      },
    });
  });

  it('uses the dark material in dark mode', () => {
    expect(
      stackChromeOptions({
        allowGlass: true,
        isDark: true,
        colors: darkColors,
      }).headerBlurEffect,
    ).toBe('systemChromeMaterialDark');
  });

  it('keeps a solid header when glass is not allowed', () => {
    const options = stackChromeOptions({
      allowGlass: false,
      isDark: false,
      colors: lightColors,
    });

    expect(options.headerTransparent).toBe(false);
    expect(options.headerBlurEffect).toBeUndefined();
    expect(options.headerStyle).toEqual({backgroundColor: lightColors.surface});
    expect(options.headerTintColor).toBe(lightColors.accent);
  });
});
