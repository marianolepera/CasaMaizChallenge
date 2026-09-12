import {SUPPORTED_CONTRACT_VERSION} from '../cms/contract';
import {
  getOperationalNoticeMessage,
  hasUsableNavigation,
  isFeatureEnabled,
  parseCmsBootstrap,
  shouldRenderFeature,
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
    expect(parseCmsBootstrap(null)).toEqual({
      navigation: {items: []},
      featureFlags: {},
      alerts: [],
      promotions: [],
    });
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

  it('parses product fields and ignores unknown extras', () => {
    const bootstrap = parseCmsBootstrap({
      navigation: {items: navigationItems},
      featureFlags: {enable_new_home: true, junk: 'nope'},
      editorialNote: 'ignore me',
    });

    expect(bootstrap.featureFlags).toEqual({enable_new_home: true});
    expect(bootstrap).not.toHaveProperty('editorialNote');
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

describe('CMS bootstrap product fields', () => {
  it('keeps boolean flags and drops non-boolean values', () => {
    const bootstrap = parseCmsBootstrap({
      featureFlags: {
        enable_new_home: true,
        show_rewards_module: false,
        show_reorder: false,
        show_store_locator_banner: true,
        junk: 'nope',
      },
    });

    expect(bootstrap.featureFlags).toEqual({
      enable_new_home: true,
      show_rewards_module: false,
      show_reorder: false,
      show_store_locator_banner: true,
    });
  });

  it('does not treat missing or false flags as enabled', () => {
    const flags = parseCmsBootstrap({
      featureFlags: {
        enable_new_home: true,
        show_rewards_module: false,
        show_reorder: false,
        show_store_locator_banner: true,
      },
    }).featureFlags;

    expect(isFeatureEnabled(flags, 'enable_new_home')).toBe(true);
    expect(isFeatureEnabled(flags, 'show_rewards_module')).toBe(false);
    expect(isFeatureEnabled(flags, 'show_reorder')).toBe(false);
    expect(isFeatureEnabled(flags, 'not_in_payload')).toBe(false);
    expect(isFeatureEnabled(undefined, 'enable_new_home')).toBe(false);
    expect(isFeatureEnabled({}, 'enable_new_home')).toBe(false);
  });

  it('does not invent feature UI when the CMS has no copy', () => {
    const flags = parseCmsBootstrap({
      featureFlags: {show_store_locator_banner: true},
    }).featureFlags;

    expect(shouldRenderFeature(flags, 'show_store_locator_banner', false)).toBe(
      false,
    );
    expect(shouldRenderFeature(flags, 'show_store_locator_banner', true)).toBe(
      true,
    );
    expect(shouldRenderFeature(flags, 'show_rewards_module', true)).toBe(false);
  });

  it('parses a CMS alert and skips incomplete alerts or actions', () => {
    const bootstrap = parseCmsBootstrap({
      alerts: [
        {id: 'no-copy'},
        {
          id: '6a5a9603de94bce2344e60ed',
          title: 'Aviso de cierre',
          message: 'Hoy tenemos un compromiso de aviso de cierre',
          placement: 'topBar',
          dismissible: true,
          priority: 100,
          pageSlugs: [],
          frequency: {type: 'always', cooldownHours: 24},
          trigger: {type: 'load', delayMs: 3000, scrollPercent: 30},
          actions: [
            {label: 'Ir a google', href: '/legal/privacy_policy'},
            {href: '/menu'},
            {label: 'Ir a menú', href: '/menu'},
          ],
        },
      ],
    });

    expect(bootstrap.alerts).toEqual([
      {
        id: '6a5a9603de94bce2344e60ed',
        title: 'Aviso de cierre',
        message: 'Hoy tenemos un compromiso de aviso de cierre',
        placement: 'topBar',
        dismissible: true,
        priority: 100,
        pageSlugs: [],
        frequency: {type: 'always', cooldownHours: 24},
        trigger: {type: 'load', delayMs: 3000, scrollPercent: 30},
        actions: [
          {
            label: 'Ir a google',
            destination: {kind: 'internal', path: '/legal/privacy_policy'},
          },
          {
            label: 'Ir a menú',
            destination: {kind: 'internal', path: '/menu'},
          },
        ],
      },
    ]);
  });

  it('parses operational notice and recommended app update', () => {
    const bootstrap = parseCmsBootstrap({
      operationalControls: {
        mode: 'notice',
        bannerMessage: 'Hoy cerramos cocina a las 22:30.',
        appUpdate: {
          policy: 'recommended',
          minimumVersion: '1.5.0',
          recommendedVersion: '2.4.0',
          message: 'Actualiza para disfrutar el nuevo menú y reservas.',
        },
      },
    });

    expect(bootstrap.operationalControls).toEqual({
      mode: 'notice',
      bannerMessage: 'Hoy cerramos cocina a las 22:30.',
      appUpdate: {
        policy: 'recommended',
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
        message: 'Actualiza para disfrutar el nuevo menú y reservas.',
      },
    });
    expect(parseCmsBootstrap({operationalControls: {}}).operationalControls).toBeUndefined();
    expect(
      getOperationalNoticeMessage(
        parseCmsBootstrap({
          operationalControls: {
            mode: 'notice',
            bannerMessage: 'Hoy cerramos cocina a las 22:30.',
          },
        }).operationalControls,
      ),
    ).toBe('Hoy cerramos cocina a las 22:30.');
    expect(getOperationalNoticeMessage(undefined)).toBeUndefined();
  });

  it('parses bootstrap promotions and skips entries without a title', () => {
    const bootstrap = parseCmsBootstrap({
      promotions: [
        {description: 'sin título'},
        {
          id: 'promo-1',
          title: 'Martes de sobremesa',
          eyebrow: 'Solo por temporada',
          description: 'Postre de maíz azul de cortesía en cenas de los martes.',
          placement: 'home',
          priority: 10,
          cta: {
            label: 'Reservar',
            destination: {path: '/reservas'},
          },
        },
      ],
    });

    expect(bootstrap.promotions).toEqual([
      {
        id: 'promo-1',
        title: 'Martes de sobremesa',
        eyebrow: 'Solo por temporada',
        description: 'Postre de maíz azul de cortesía en cenas de los martes.',
        placement: 'home',
        priority: 10,
        ctaLabel: 'Reservar',
        destination: {kind: 'internal', path: '/reservas'},
      },
    ]);
  });
});
