import {lightColors} from '../theme/colors';
import {
  platformElevation,
  platformSurfaceStyle,
} from '../theme/platformSurface';

describe('platform surfaces', () => {
  it('uses elevation and tonal fill on Android', () => {
    expect(platformElevation('android', 'card')).toBe(1);
    expect(platformElevation('android', 'banner')).toBe(2);
    expect(platformElevation('android', 'chrome')).toBe(4);
    expect(
      platformSurfaceStyle('android', lightColors, 'banner'),
    ).toEqual({
      backgroundColor: lightColors.surfaceMuted,
      borderColor: 'transparent',
      borderWidth: 0,
      elevation: 2,
    });
  });

  it('keeps a hairline border on iOS instead of elevation', () => {
    expect(platformElevation('ios', 'chrome')).toBe(0);
    expect(platformSurfaceStyle('ios', lightColors, 'card')).toEqual({
      backgroundColor: lightColors.surface,
      borderColor: lightColors.border,
      borderWidth: 1,
      elevation: 0,
    });
  });
});
