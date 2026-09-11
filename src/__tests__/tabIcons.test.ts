import {resolveTabIconKey} from '../navigation/tabIcons';

describe('tab icons', () => {
  it('uses a known CMS icon key when present', () => {
    expect(resolveTabIconKey('menu', 'Menu')).toBe('menu');
    expect(resolveTabIconKey('info', 'Home')).toBe('info');
    expect(resolveTabIconKey('home', 'Home')).toBe('home');
  });

  it('falls back to the tab route when the CMS icon is missing or unknown', () => {
    expect(resolveTabIconKey(undefined, 'Home')).toBe('home');
    expect(resolveTabIconKey(undefined, 'Menu')).toBe('menu');
    expect(resolveTabIconKey('sparkle', 'Home')).toBe('home');
  });
});
