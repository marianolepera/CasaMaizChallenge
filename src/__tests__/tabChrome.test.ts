import {lightColors} from '../theme/colors';
import {colorWithAlpha, tabBarOverlayInset} from '../theme/glass';
import {tabChromeStyle} from '../navigation/tabChrome';

describe('tab chrome', () => {
  it('uses a translucent overlay tab bar when glass is allowed', () => {
    expect(
      tabChromeStyle({
        allowGlass: true,
        platform: 'ios',
        colors: lightColors,
        minTouchTarget: 44,
      }),
    ).toEqual({
      position: 'absolute',
      backgroundColor: colorWithAlpha(lightColors.surface, 0.72),
      borderTopColor: colorWithAlpha(lightColors.border, 0.45),
      elevation: 0,
      minHeight: 44,
    });
  });

  it('keeps a solid tab bar when glass is not allowed', () => {
    expect(
      tabChromeStyle({
        allowGlass: false,
        platform: 'ios',
        colors: lightColors,
        minTouchTarget: 44,
      }),
    ).toEqual({
      backgroundColor: lightColors.surface,
      borderTopColor: lightColors.border,
      minHeight: 44,
    });
  });

  it('uses Material elevation on Android instead of a hairline', () => {
    expect(
      tabChromeStyle({
        allowGlass: false,
        platform: 'android',
        colors: lightColors,
        minTouchTarget: 44,
      }),
    ).toEqual({
      backgroundColor: lightColors.surface,
      borderTopWidth: 0,
      elevation: 4,
      minHeight: 44,
    });
  });

  it('reserves space so dishes are not hidden under the overlay', () => {
    expect(tabBarOverlayInset(34, 44)).toBe(78);
  });
});
