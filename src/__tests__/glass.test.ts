import {colorWithAlpha, resolveAllowGlass} from '../theme/glass';

describe('glass chrome', () => {
  it('allows glass only on iOS when Reduce Transparency is off', () => {
    expect(resolveAllowGlass('ios', false)).toBe(true);
    expect(resolveAllowGlass('ios', true)).toBe(false);
    expect(resolveAllowGlass('android', false)).toBe(false);
    expect(resolveAllowGlass('android', true)).toBe(false);
  });

  it('turns theme hex colors into translucent rgba', () => {
    expect(colorWithAlpha('#FFFFFF', 0.72)).toBe('rgba(255, 255, 255, 0.72)');
    expect(colorWithAlpha('#231C18', 0.72)).toBe('rgba(35, 28, 24, 0.72)');
  });
});
