import {SUPPORTED_CONTRACT_VERSION} from '../cms/contract';
import {
  hasUsableNavigation,
  parseCmsBootstrap,
} from '../cms/bootstrap';
import {createContentRepository} from '../repository/contentRepository';
import {createMemoryStore} from '../repository/memoryStorage';

const navigationItems = [
  {
    label: 'Inicio',
    highlighted: false,
    destination: {key: 'home', label: 'Home', path: '/'},
  },
  {
    label: 'Menú',
    icon: 'menu',
    highlighted: false,
    destination: {key: 'menu', label: 'Menu', path: '/menu'},
  },
  {
    label: 'Reservar',
    highlighted: true,
    destination: {key: 'reservations', label: 'Reservations', path: '/reservas'},
  },
  {
    label: 'Privacidad',
    icon: 'info',
    highlighted: false,
    destination: {
      key: 'privacy',
      label: 'Privacy',
      path: '/legal/privacy_policy',
    },
  },
];

describe('CMS bootstrap navigation', () => {
  it('keeps CMS labels and destination order', () => {
    const bootstrap = parseCmsBootstrap({
      navigation: {key: 'main', name: 'Main navigation', items: navigationItems},
    });

    expect(bootstrap.navigation.key).toBe('main');
    expect(bootstrap.navigation.name).toBe('Main navigation');
    expect(bootstrap.navigation.items.map(item => item.label)).toEqual([
      'Inicio',
      'Menú',
      'Reservar',
      'Privacidad',
    ]);
    expect(bootstrap.navigation.items.map(item => item.destination)).toEqual([
      {kind: 'internal', path: '/'},
      {kind: 'internal', path: '/menu'},
      {kind: 'internal', path: '/reservas'},
      {kind: 'internal', path: '/legal/privacy_policy'},
    ]);
    expect(bootstrap.navigation.items[1]).toEqual(
      expect.objectContaining({icon: 'menu', highlighted: false}),
    );
    expect(bootstrap.navigation.items[2].highlighted).toBe(true);
  });

  it('skips incomplete items instead of crashing', () => {
    const bootstrap = parseCmsBootstrap({
      navigation: {
        items: [
          {destination: {path: '/menu'}},
          {label: '   '},
          {label: 'Menú', destination: {path: '/menu'}},
          'not-an-item',
        ],
      },
    });

    expect(bootstrap.navigation.items).toEqual([
      {
        label: 'Menú',
        destination: {kind: 'internal', path: '/menu'},
        highlighted: false,
      },
    ]);
  });

  it('returns empty navigation when bootstrap data is missing or malformed', () => {
    expect(parseCmsBootstrap(null).navigation.items).toEqual([]);
    expect(parseCmsBootstrap({}).navigation.items).toEqual([]);
    expect(
      parseCmsBootstrap({navigation: {items: {label: 'Inicio'}}}).navigation
        .items,
    ).toEqual([]);
    expect(hasUsableNavigation(parseCmsBootstrap({}).navigation)).toBe(false);
  });

  it('falls back to experience.navigation when top-level navigation is absent', () => {
    const bootstrap = parseCmsBootstrap({
      experience: {
        navigation: {
          items: [{label: 'Inicio', destination: {path: '/'}}],
        },
      },
    });

    expect(bootstrap.navigation.items).toEqual([
      {
        label: 'Inicio',
        destination: {kind: 'internal', path: '/'},
        highlighted: false,
      },
    ]);
    expect(hasUsableNavigation(bootstrap.navigation)).toBe(true);
  });

  it('keeps unsupported destinations for a safe fallback later', () => {
    const bootstrap = parseCmsBootstrap({
      navigation: {
        items: [
          {label: 'Inicio', destination: {path: '/'}},
          {label: 'Blog', destination: {path: '/no-existe'}},
        ],
      },
    });

    expect(bootstrap.navigation.items[1]).toEqual({
      label: 'Blog',
      destination: {kind: 'unsupported', reason: 'unknown-internal-path'},
      highlighted: false,
    });
    expect(hasUsableNavigation(bootstrap.navigation)).toBe(true);
  });

  it('tolerates extra bootstrap fields used by later slices', () => {
    const bootstrap = parseCmsBootstrap({
      navigation: {items: navigationItems},
      featureFlags: {enable_new_home: true},
      editorialNote: 'keep me',
    });

    expect(bootstrap).toEqual(
      expect.objectContaining({
        featureFlags: {enable_new_home: true},
        editorialNote: 'keep me',
      }),
    );
  });

  it('can read a cached bootstrap envelope and still parse navigation', async () => {
    const repository = createContentRepository(createMemoryStore());
    const now = new Date('2026-09-11T12:00:00.000Z');
    const context = {
      platform: 'ios' as const,
      market: 'MX' as const,
      audience: 'guest' as const,
      appVersion: '1.0.0',
    };

    await repository.writeBootstrap(
      context,
      {
        contractVersion: SUPPORTED_CONTRACT_VERSION,
        data: {navigation: {items: navigationItems}},
        preview: false,
        nextChangeAt: '2026-10-25T04:15:00.000Z',
      },
      {now},
    );

    const cached = await repository.readBootstrap(context, {now});
    expect(cached.status).toBe('hit');
    if (cached.status !== 'hit') {
      return;
    }

    expect(parseCmsBootstrap(cached.envelope.data).navigation.items[0].label).toBe(
      'Inicio',
    );
  });
});
