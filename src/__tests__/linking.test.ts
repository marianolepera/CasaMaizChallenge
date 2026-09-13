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

  it('opens Home, Menu, Privacy, and Reservations from the linking config', () => {
    expect(appLinking.prefixes).toEqual(['casamaiz://']);
    expect(appLinking.getStateFromPath?.('menu', linkingOptions)?.routes[0]).toMatchObject({
      name: 'Tabs',
    });

    const privacyState = appLinking.getStateFromPath?.(
      'legal/privacy_policy',
      linkingOptions,
    );
    expect(privacyState?.routes.map(route => route.name)).toEqual([
      'Tabs',
      'Privacy',
    ]);
    expect(privacyState?.index).toBe(1);

    const reservationsState = appLinking.getStateFromPath?.(
      'reservas',
      linkingOptions,
    );
    expect(reservationsState?.routes.map(route => route.name)).toEqual([
      'Tabs',
      'Reservations',
    ]);
    expect(reservationsState?.index).toBe(1);
  });

  it('ignores unknown paths safely', () => {
    expect(appLinking.getStateFromPath?.('no-existe', linkingOptions)).toBeUndefined();
  });
});
