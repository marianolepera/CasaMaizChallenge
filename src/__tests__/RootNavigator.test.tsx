import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {networkError} from '../api/errors';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
import {RootNavigator} from '../navigation/RootNavigator';
import {navigationRef} from '../navigation/navigationRef';
import {createContentRepository} from '../repository/contentRepository';
import {ContentRepositoryProvider} from '../repository/ContentRepositoryProvider';
import {createMemoryStore} from '../repository/memoryStorage';
import {HOME_PROMOTIONS_TEST_ID} from '../components/molecules/BootstrapPromotions';
import {OPERATIONAL_NOTICE_MESSAGE_TEST_ID} from '../components/molecules/OperationalNotice';
import {
  APP_UPDATE_DISMISS_TEST_ID,
  APP_UPDATE_MESSAGE_TEST_ID,
} from '../components/molecules/AppUpdateNotice';
import {
  CMS_ALERT_DISMISS_TEST_ID,
  CMS_ALERT_MESSAGE_TEST_ID,
  CMS_ALERT_TEST_ID,
  CMS_ALERT_TITLE_TEST_ID,
} from '../components/molecules/CmsAlertBanner';
import {LEGAL_TITLE_TEST_ID} from '../screens/PrivacyScreen';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function mockClient(overrides: Partial<CmsClient>): CmsClient {
  return {
    getBootstrap: jest.fn(),
    getLegal: jest.fn(),
    resolveMediaUrl: jest.fn(),
    getPage: jest.fn().mockResolvedValue({
      contractVersion: '1.1',
      data: {slug: 'home', title: 'Casa Maíz', layout: []},
    }),
    ...overrides,
  };
}

function bootstrapEnvelope(
  items: unknown[],
  extra: Record<string, unknown> = {},
): ContentEnvelope {
  return {
    contractVersion: '1.1',
    data: {navigation: {items}, ...extra},
    preview: false,
    nextChangeAt: '2026-10-25T04:15:00.000Z',
  };
}

function renderRoot(client: CmsClient) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <CmsClientProvider client={client}>
          <ContentRepositoryProvider
            repository={createContentRepository(createMemoryStore())}>
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </ContentRepositoryProvider>
        </CmsClientProvider>
      </SafeAreaProvider>,
    );
  });
  return tree!;
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('RootNavigator', () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  afterEach(async () => {
    if (tree) {
      await ReactTestRenderer.act(() => {
        tree?.unmount();
      });
      tree = undefined;
    }
    await AsyncStorage.clear();
  });

  it('shows CMS tab labels for home and menu', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope([
            {label: 'Inicio', destination: {path: '/'}},
            {label: 'Menú', destination: {path: '/menu'}},
            {label: 'Reservar', destination: {path: '/reservas'}},
            {
              label: 'Privacidad',
              destination: {path: '/legal/privacy_policy'},
            },
          ]),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(tree.root.findByProps({testID: 'cms-tab-Home'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'cms-tab-Menu'})).toBeTruthy();
    expect(tree.root.findAllByProps({testID: 'cms-tab-icon-Home'}).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({testID: 'cms-tab-icon-Menu'}).length).toBeGreaterThan(0);
    expect(tree.root.findByProps({testID: 'home-screen'})).toBeTruthy();
    expect(() =>
      tree!.root.findByProps({testID: 'cms-operational-notice'}),
    ).toThrow();
  });

  it('falls back to Home when bootstrap has no tab routes', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope([
            {label: 'Reservar', destination: {path: '/reservas'}},
          ]),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(tree.root.findByProps({testID: 'home-screen'})).toBeTruthy();
    expect(() => tree!.root.findByProps({testID: 'cms-tab-Home'})).toThrow();
    expect(() => tree!.root.findByProps({testID: 'cms-tab-Menu'})).toThrow();
  });

  it('shows retry when bootstrap fails and there is no cache', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest
          .fn()
          .mockRejectedValue(networkError()) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(tree.root.findByProps({testID: 'cms-error-state'})).toBeTruthy();
  });

  it('shows bootstrap home promotions when enable_new_home is on', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              featureFlags: {enable_new_home: true},
              promotions: [
                {
                  title: 'Martes de sobremesa',
                  placement: 'home',
                  cta: {label: 'Reservar', destination: {path: '/reservas'}},
                },
              ],
            },
          ),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(tree.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID})).toBeTruthy();
    expect(
      tree.root.findAllByProps({children: 'Martes de sobremesa'}).length,
    ).toBeGreaterThan(0);
  });

  it('does not duplicate a bootstrap promo already in the home promoRail', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              featureFlags: {enable_new_home: true},
              promotions: [
                {title: 'Martes de sobremesa', placement: 'home'},
              ],
            },
          ),
        ) as CmsClient['getBootstrap'],
        getPage: jest.fn().mockResolvedValue({
          contractVersion: '1.1',
          data: {
            slug: 'home',
            title: 'Casa Maíz',
            layout: [
              {
                blockType: 'promoRail',
                title: 'Algo especial está en la mesa',
                promotions: [{title: 'Martes de sobremesa'}],
              },
            ],
          },
          preview: false,
        }) as CmsClient['getPage'],
      }),
    );

    await flush();

    expect(() =>
      tree!.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID}),
    ).toThrow();
    expect(tree.root.findByProps({testID: 'cms-promo-rail'})).toBeTruthy();
    expect(
      tree.root.findAllByProps({children: 'Martes de sobremesa'}).length,
    ).toBeGreaterThan(0);
  });

  it('shows the CMS operational notice when bootstrap has a banner', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              operationalControls: {
                mode: 'notice',
                bannerMessage: 'Hoy cerramos cocina a las 22:30.',
              },
            },
          ),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(
      tree.root.findByProps({testID: OPERATIONAL_NOTICE_MESSAGE_TEST_ID}).props
        .children,
    ).toBe('Hoy cerramos cocina a las 22:30.');
    expect(() =>
      tree!.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}),
    ).toThrow();
  });

  it('shows a dismissible CMS app update above the operational notice', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
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
            },
          ),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}).props.children,
    ).toBe('Actualiza para disfrutar el nuevo menú y reservas.');
    expect(
      tree.root.findByProps({testID: OPERATIONAL_NOTICE_MESSAGE_TEST_ID}).props
        .children,
    ).toBe('Hoy cerramos cocina a las 22:30.');
    expect(tree.root.findByProps({testID: 'home-screen'})).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      tree?.root.findByProps({testID: APP_UPDATE_DISMISS_TEST_ID}).props.onPress();
    });

    expect(() =>
      tree!.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}),
    ).toThrow();
    expect(
      tree.root.findByProps({testID: OPERATIONAL_NOTICE_MESSAGE_TEST_ID}).props
        .children,
    ).toBe('Hoy cerramos cocina a las 22:30.');
  });

  it('blocks Home when the CMS requires an app update', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              operationalControls: {
                appUpdate: {
                  policy: 'required',
                  minimumVersion: '1.5.0',
                  message: 'Actualiza para disfrutar el nuevo menú y reservas.',
                },
              },
            },
          ),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();

    expect(
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}).props.children,
    ).toBe('Actualiza para disfrutar el nuevo menú y reservas.');
    expect(() => tree!.root.findByProps({testID: 'home-screen'})).toThrow();
    expect(() =>
      tree!.root.findByProps({testID: APP_UPDATE_DISMISS_TEST_ID}),
    ).toThrow();
  });

  it('opens Menu from a CMS home action', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope([
            {label: 'Inicio', destination: {path: '/'}},
            {label: 'Menú', destination: {path: '/menu'}},
          ]),
        ) as CmsClient['getBootstrap'],
        getPage: jest.fn(async slug => {
          if (slug === 'menu') {
            return {
              contractVersion: '1.1',
              data: {
                title: 'Menu',
                layout: [
                  {blockType: 'textBlock', heading: 'From the milpa to the table'},
                ],
              },
            };
          }
          return {
            contractVersion: '1.1',
            data: {
              title: 'Casa Maíz',
              layout: [
                {
                  blockType: 'restaurantHero',
                  headline: 'El maíz tiene memoria',
                  actions: [{label: 'Ver el menú', href: '/menu'}],
                },
              ],
            },
          };
        }) as CmsClient['getPage'],
      }),
    );

    await flush();

    await ReactTestRenderer.act(async () => {
      tree?.root.findByProps({accessibilityLabel: 'Ver el menú'}).props.onPress();
    });
    await flush();

    expect(tree.root.findByProps({testID: 'menu-screen'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('From the milpa to the table');
  });

  it('opens Privacy from a CMS home action', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope([
            {label: 'Inicio', destination: {path: '/'}},
            {label: 'Menú', destination: {path: '/menu'}},
            {
              label: 'Privacidad',
              destination: {path: '/legal/privacy_policy'},
            },
          ]),
        ) as CmsClient['getBootstrap'],
        getPage: jest.fn().mockResolvedValue({
          contractVersion: '1.1',
          data: {
            layout: [
              {
                blockType: 'restaurantCTA',
                label: 'Aviso de privacidad',
                href: '/legal/privacy_policy',
              },
            ],
          },
        }) as CmsClient['getPage'],
        getLegal: jest.fn().mockResolvedValue({
          contractVersion: '1.1',
          data: {
            title: 'Aviso de privacidad',
            summary: 'Cómo usamos y protegemos tus datos.',
          },
        }) as CmsClient['getLegal'],
      }),
    );

    await flush();

    await ReactTestRenderer.act(async () => {
      tree?.root
        .findByProps({accessibilityLabel: 'Aviso de privacidad'})
        .props.onPress();
    });
    await flush();

    expect(tree.root.findByProps({testID: 'privacy-screen'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: LEGAL_TITLE_TEST_ID}).props.children,
    ).toBe('Aviso de privacidad');
  });

  it('shows the CMS topBar alert after the load delay', async () => {
    jest.useFakeTimers();
    try {
      tree = renderRoot(
        mockClient({
          getBootstrap: jest.fn().mockResolvedValue(
            bootstrapEnvelope(
              [
                {label: 'Inicio', destination: {path: '/'}},
                {label: 'Menú', destination: {path: '/menu'}},
              ],
              {
                alerts: [
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
                      {label: 'Ir a menú', href: '/menu'},
                    ],
                  },
                ],
              },
            ),
          ) as CmsClient['getBootstrap'],
        }),
      );

      await flush();
      expect(() => tree!.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();

      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(
        tree.root.findByProps({testID: CMS_ALERT_TITLE_TEST_ID}).props.children,
      ).toBe('Aviso de cierre');
      expect(
        tree.root.findByProps({testID: CMS_ALERT_MESSAGE_TEST_ID}).props.children,
      ).toBe('Hoy tenemos un compromiso de aviso de cierre');
      expect(tree.root.findByProps({accessibilityLabel: 'Ir a google'})).toBeTruthy();
      expect(tree.root.findByProps({accessibilityLabel: 'Ir a menú'})).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('opens Menu from a CMS alert action', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              alerts: [
                {
                  title: 'Aviso de cierre',
                  placement: 'topBar',
                  dismissible: true,
                  trigger: {type: 'load', delayMs: 0},
                  actions: [{label: 'Ir a menú', href: '/menu'}],
                },
              ],
            },
          ),
        ) as CmsClient['getBootstrap'],
        getPage: jest.fn(async slug => {
          if (slug === 'menu') {
            return {
              contractVersion: '1.1',
              data: {
                title: 'Menu',
                layout: [
                  {blockType: 'textBlock', heading: 'From the milpa to the table'},
                ],
              },
            };
          }
          return {
            contractVersion: '1.1',
            data: {slug: 'home', title: 'Casa Maíz', layout: []},
          };
        }) as CmsClient['getPage'],
      }),
    );

    await flush();

    await ReactTestRenderer.act(async () => {
      tree?.root.findByProps({accessibilityLabel: 'Ir a menú'}).props.onPress();
    });
    await flush();

    expect(tree.root.findByProps({testID: 'menu-screen'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('From the milpa to the table');
  });

  it('dismisses the CMS alert from Home', async () => {
    tree = renderRoot(
      mockClient({
        getBootstrap: jest.fn().mockResolvedValue(
          bootstrapEnvelope(
            [
              {label: 'Inicio', destination: {path: '/'}},
              {label: 'Menú', destination: {path: '/menu'}},
            ],
            {
              alerts: [
                {
                  id: '6a5a9603de94bce2344e60ed',
                  title: 'Aviso de cierre',
                  message: 'Hoy tenemos un compromiso de aviso de cierre',
                  placement: 'topBar',
                  dismissible: true,
                  trigger: {type: 'load', delayMs: 0},
                  frequency: {type: 'always', cooldownHours: 24},
                },
              ],
            },
          ),
        ) as CmsClient['getBootstrap'],
      }),
    );

    await flush();
    expect(tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      tree?.root.findByProps({testID: CMS_ALERT_DISMISS_TEST_ID}).props.onPress();
    });

    expect(() => tree!.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();
    expect(tree.root.findByProps({testID: 'home-screen'})).toBeTruthy();
  });
});
