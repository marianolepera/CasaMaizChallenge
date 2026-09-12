import {parseCmsBootstrap} from '../cms/bootstrap';
import {
  privacyTabLabel,
  reservationsNavLabel,
  toTabRoutes,
} from '../navigation/routes';

const navigationItems = [
  {
    label: 'Inicio',
    destination: {path: '/'},
  },
  {
    label: 'Menú',
    destination: {path: '/menu'},
  },
  {
    label: 'Reservar',
    destination: {path: '/reservas'},
  },
  {
    label: 'Privacidad',
    destination: {path: '/legal/privacy_policy'},
  },
];

describe('navigation tab routes', () => {
  it('maps CMS home and menu items to tabs and keeps CMS labels', () => {
    const navigation = parseCmsBootstrap({
      navigation: {items: navigationItems},
    }).navigation;

    expect(toTabRoutes(navigation)).toEqual([
      {name: 'Home', label: 'Inicio', path: '/'},
      {name: 'Menu', label: 'Menú', path: '/menu'},
    ]);
    expect(privacyTabLabel(navigation)).toBe('Privacidad');
    expect(reservationsNavLabel(navigation)).toBe('Reservar');
  });

  it('forwards CMS icon keys onto tab routes', () => {
    const navigation = parseCmsBootstrap({
      navigation: {
        items: [
          {label: 'Inicio', destination: {path: '/'}},
          {label: 'Menú', icon: 'menu', destination: {path: '/menu'}},
        ],
      },
    }).navigation;

    expect(toTabRoutes(navigation)).toEqual([
      {name: 'Home', label: 'Inicio', path: '/'},
      {name: 'Menu', label: 'Menú', path: '/menu', icon: 'menu'},
    ]);
  });

  it('skips reservations, unsupported paths, and duplicate destinations', () => {
    const navigation = parseCmsBootstrap({
      navigation: {
        items: [
          {label: 'Casa', destination: {path: '/'}},
          {label: 'Inicio otra vez', destination: {path: '/'}},
          {label: 'Reservar', destination: {path: '/reservas'}},
          {label: 'Blog', destination: {path: '/no-existe'}},
          {label: 'Carta', destination: {path: '/menu'}},
        ],
      },
    }).navigation;

    expect(toTabRoutes(navigation)).toEqual([
      {name: 'Home', label: 'Casa', path: '/'},
      {name: 'Menu', label: 'Carta', path: '/menu'},
    ]);
  });

  it('returns no tabs when navigation is not usable for screens', () => {
    const navigation = parseCmsBootstrap({
      navigation: {
        items: [{label: 'Reservar', destination: {path: '/reservas'}}],
      },
    }).navigation;

    expect(toTabRoutes(navigation)).toEqual([]);
    expect(privacyTabLabel(navigation)).toBeUndefined();
  });
});
