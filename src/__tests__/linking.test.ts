import {appLinking, destinationFromLinkingPath} from '../navigation/linking';

const linkingOptions = {
  screens: appLinking.config?.screens ?? {},
};

describe('app linking', () => {
  it('maps leftover casamaiz paths to CMS destinations', () => {
    expect(destinationFromLinkingPath('')).toEqual({kind: 'internal', path: '/'});
    expect(destinationFromLinkingPath('menu')).toEqual({
      kind: 'internal',
      path: '/menu',
    });
    expect(destinationFromLinkingPath('/legal/privacy_policy')).toEqual({
      kind: 'internal',
      path: '/legal/privacy_policy',
    });
  });

  it('opens Home, Menu, and Privacy from the linking config', () => {
    expect(appLinking.prefixes).toEqual(['casamaiz://']);
    expect(appLinking.getStateFromPath?.('menu', linkingOptions)?.routes[0]).toMatchObject({
      name: 'Tabs',
    });
    expect(
      appLinking.getStateFromPath?.('legal/privacy_policy', linkingOptions)
        ?.routes[0],
    ).toMatchObject({name: 'Privacy'});
  });

  it('keeps reservas as a placeholder and ignores unknown paths', () => {
    expect(appLinking.getStateFromPath?.('reservas', linkingOptions)).toBeUndefined();
    expect(appLinking.getStateFromPath?.('no-existe', linkingOptions)).toBeUndefined();
  });
});
