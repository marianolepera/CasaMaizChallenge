import React from 'react';
import {Image, Platform} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {networkError} from '../api/errors';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
import {
  OFFLINE_BANNER_MESSAGE,
  OFFLINE_BANNER_TEST_ID,
} from '../components/molecules/OfflineBanner';
import {DEFAULT_APP_VERSION, contentQueryFromRuntime} from '../config';
import {contentCacheKey} from '../repository/cacheKey';
import {createContentRepository} from '../repository/contentRepository';
import {ContentRepositoryProvider} from '../repository/ContentRepositoryProvider';
import type {ContentRepository} from '../repository/contentRepository';
import {createMemoryStore} from '../repository/memoryStorage';
import {HomeScreen} from '../screens/HomeScreen';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

const queryContext = contentQueryFromRuntime({
  platform: Platform.OS,
  appVersion: DEFAULT_APP_VERSION,
});

function mockClient(overrides: Partial<CmsClient>): CmsClient {
  return {
    getBootstrap: jest.fn(),
    getLegal: jest.fn(),
    resolveMediaUrl: jest.fn(),
    getPage: jest.fn(),
    ...overrides,
  };
}

function pageEnvelope(
  heading: string,
  nextChangeAt = '2026-10-25T04:15:00.000Z',
): ContentEnvelope {
  return {
    contractVersion: '1.1',
    data: {
      title: 'Casa Maíz',
      layout: [{blockType: 'textBlock', heading}],
    },
    preview: false,
    nextChangeAt,
  };
}

function renderHome(client: CmsClient, repository: ContentRepository) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <CmsClientProvider client={client}>
          <ContentRepositoryProvider repository={repository}>
            <HomeScreen />
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

describe('cache and offline fallback', () => {
  const fetchFn = jest.fn();
  const prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

  beforeEach(() => {
    fetchFn.mockReset();
    prefetch.mockClear();
    globalThis.fetch = fetchFn as typeof fetch;
  });

  afterAll(() => {
    prefetch.mockRestore();
  });

  afterEach(() => {
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('persists a successful page and shows it with a banner when the network fails', async () => {
    const repository = createContentRepository(createMemoryStore());
    const firstTree = renderHome(
      mockClient({
        getPage: jest
          .fn()
          .mockResolvedValue(pageEnvelope('Hola CMS')) as CmsClient['getPage'],
      }),
      repository,
    );
    await flush();

    expect(
      firstTree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props
        .children,
    ).toBe('Hola CMS');
    expect(() =>
      firstTree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID}),
    ).toThrow();

    await ReactTestRenderer.act(() => {
      firstTree.unmount();
    });

    const getPage = jest
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(
        pageEnvelope('De nuevo en línea'),
      ) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}), repository);
    await flush();

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Hola CMS');
    expect(tree.root.findByProps({testID: 'cms-page-layout'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID}).props
        .accessibilityLabel,
    ).toBe(OFFLINE_BANNER_MESSAGE);
    expect(() => tree.root.findByProps({testID: 'cms-error-state'})).toThrow();

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({accessibilityLabel: 'Reintentar'}).props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('De nuevo en línea');
    expect(() => tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();
  });

  it('does not present expired cached content as current', async () => {
    const store = createMemoryStore();
    const repository = createContentRepository(store);
    await store.setItem(
      contentCacheKey({kind: 'page', slug: 'home'}, queryContext),
      JSON.stringify(
        pageEnvelope('Contenido vencido', '2020-01-01T00:00:00.000Z'),
      ),
    );

    const tree = renderHome(
      mockClient({
        getPage: jest.fn().mockRejectedValue(networkError()) as CmsClient['getPage'],
      }),
      repository,
    );
    await flush();

    expect(tree.root.findByProps({testID: 'cms-error-state'})).toBeTruthy();
    expect(tree.root.findByProps({accessibilityLabel: 'Reintentar'})).toBeTruthy();
    expect(() =>
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}),
    ).toThrow();
    expect(() => tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();
  });
});
