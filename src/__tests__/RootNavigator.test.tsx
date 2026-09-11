import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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

function bootstrapEnvelope(items: unknown[]): ContentEnvelope {
  return {
    contractVersion: '1.1',
    data: {navigation: {items}},
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
});
