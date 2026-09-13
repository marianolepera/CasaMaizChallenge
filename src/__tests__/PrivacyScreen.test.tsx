import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {HeaderHeightContext} from '@react-navigation/elements';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {networkError} from '../api/errors';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
import {OFFLINE_BANNER_TEST_ID} from '../components/molecules/OfflineBanner';
import {NetworkStatusProvider} from '../hooks/useNetworkStatus';
import {createContentRepository} from '../repository/contentRepository';
import {ContentRepositoryProvider} from '../repository/ContentRepositoryProvider';
import {createMemoryStore} from '../repository/memoryStorage';
import {
  LEGAL_BODY_TEST_ID,
  LEGAL_SUMMARY_TEST_ID,
  LEGAL_TITLE_TEST_ID,
  PrivacyScreen,
} from '../screens/PrivacyScreen';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function mockClient(overrides: Partial<CmsClient>): CmsClient {
  return {
    getBootstrap: jest.fn(),
    getPage: jest.fn(),
    resolveMediaUrl: jest.fn(),
    getLegal: jest.fn(),
    ...overrides,
  };
}

function legalEnvelope(): ContentEnvelope {
  return {
    contractVersion: '1.1',
    data: {
      title: 'Aviso de privacidad',
      summary: 'Cómo usamos y protegemos tus datos.',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Casa Maíz utiliza tus datos únicamente para gestionar reservaciones.',
                },
              ],
            },
          ],
        },
      },
    },
    preview: false,
  };
}

function renderPrivacy(
  client: CmsClient,
  headerHeight?: number,
  isOnline = true,
) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <NetworkStatusProvider isOnline={isOnline}>
          <CmsClientProvider client={client}>
            <ContentRepositoryProvider
              repository={createContentRepository(createMemoryStore())}>
              <HeaderHeightContext.Provider value={headerHeight}>
                <PrivacyScreen />
              </HeaderHeightContext.Provider>
            </ContentRepositoryProvider>
          </CmsClientProvider>
        </NetworkStatusProvider>
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

describe('PrivacyScreen', () => {
  it('loads privacy_policy and renders CMS legal copy', async () => {
    const getLegal = jest
      .fn()
      .mockResolvedValue(legalEnvelope()) as CmsClient['getLegal'];
    const tree = renderPrivacy(mockClient({getLegal}));

    await flush();

    expect(getLegal).toHaveBeenCalledWith(
      'privacy_policy',
      expect.any(AbortSignal),
    );
    expect(tree.root.findByProps({testID: 'privacy-screen'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: LEGAL_TITLE_TEST_ID}).props.children,
    ).toBe('Aviso de privacidad');
    expect(
      tree.root.findByProps({testID: LEGAL_SUMMARY_TEST_ID}).props.children,
    ).toBe('Cómo usamos y protegemos tus datos.');
    expect(
      tree.root.findByProps({testID: LEGAL_BODY_TEST_ID}).props.children,
    ).toBe(
      'Casa Maíz utiliza tus datos únicamente para gestionar reservaciones.',
    );
  });

  it('shows a retryable error when legal content is unavailable', async () => {
    const tree = renderPrivacy(
      mockClient({
        getLegal: jest
          .fn()
          .mockRejectedValue(networkError()) as CmsClient['getLegal'],
      }),
    );

    await flush();

    expect(tree.root.findByProps({testID: 'cms-error-state'})).toBeTruthy();
  });

  it('offsets banners below a glass header', async () => {
    const tree = renderPrivacy(
      mockClient({
        getLegal: jest
          .fn()
          .mockResolvedValue(legalEnvelope()) as CmsClient['getLegal'],
      }),
      96,
    );

    await flush();

    expect(tree.root.findByProps({testID: 'privacy-screen'}).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({paddingTop: 96})]),
    );
  });

  it('leaves the offline banner to the app shell, above the header', async () => {
    const getLegal = jest
      .fn()
      .mockResolvedValue(legalEnvelope()) as CmsClient['getLegal'];
    const online = renderPrivacy(mockClient({getLegal}), 96);
    await flush();

    expect(() =>
      online.root.findByProps({testID: OFFLINE_BANNER_TEST_ID}),
    ).toThrow();

    const offline = renderPrivacy(mockClient({getLegal}), 96, false);
    await flush();

    const frame = offline.root.findByProps({testID: 'privacy-screen'});
    expect(frame.findAllByProps({testID: OFFLINE_BANNER_TEST_ID})).toHaveLength(
      0,
    );
    expect(frame.findByProps({testID: LEGAL_TITLE_TEST_ID})).toBeTruthy();
  });
});
