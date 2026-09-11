import {parseAppearancePreference, resolveIsDark} from '../theme/appearance';

describe('appearance preference', () => {
  it('parses stored Auto / Claro / Oscuro values', () => {
    expect(parseAppearancePreference('system')).toBe('system');
    expect(parseAppearancePreference('light')).toBe('light');
    expect(parseAppearancePreference('dark')).toBe('dark');
    expect(parseAppearancePreference('nope')).toBeUndefined();
    expect(parseAppearancePreference(null)).toBeUndefined();
  });

  it('resolves dark mode from preference and the system scheme', () => {
    expect(resolveIsDark('dark', 'light')).toBe(true);
    expect(resolveIsDark('light', 'dark')).toBe(false);
    expect(resolveIsDark('system', 'dark')).toBe(true);
    expect(resolveIsDark('system', 'light')).toBe(false);
    expect(resolveIsDark('system', null)).toBe(false);
  });
});
