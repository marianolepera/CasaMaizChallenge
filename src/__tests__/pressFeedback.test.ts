import {androidRippleColor, pressOpacity} from '../theme/pressFeedback';

describe('press feedback', () => {
  it('fades on iOS and keeps full opacity on Android', () => {
    expect(pressOpacity('ios', true)).toBe(0.85);
    expect(pressOpacity('ios', false)).toBe(1);
    expect(pressOpacity('android', true)).toBe(1);
    expect(pressOpacity('android', false)).toBe(1);
    expect(pressOpacity('android', true, true)).toBe(0.5);
  });

  it('exposes a ripple color only on Android', () => {
    expect(androidRippleColor('android', 'rgba(0, 0, 0, 0.4)')).toEqual({
      color: 'rgba(0, 0, 0, 0.4)',
    });
    expect(androidRippleColor('ios', 'rgba(0, 0, 0, 0.4)')).toBeUndefined();
  });
});
