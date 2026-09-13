import React from 'react';
import {Image} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {networkError} from '../api/errors';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
import {OFFLINE_BANNER_TEST_ID} from '../components/molecules/OfflineBanner';
import {createContentRepository} from '../repository/contentRepository';
import {ContentRepositoryProvider} from '../repository/ContentRepositoryProvider';
import type {ContentRepository} from '../repository/contentRepository';
import {createMemoryStore} from '../repository/memoryStorage';
import {NetworkStatusProvider} from '../hooks/useNetworkStatus';
import {HomeScreen} from '../screens/HomeScreen';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function mockClient(overrides: Partial<CmsClient>): CmsClient {
  return {
    getBootstrap: jest.fn(),
    getLegal: jest.fn(),
    resolveMediaUrl: jest.fn(),
    getPage: jest.fn(),
    ...overrides,
  };
}

function pageEnvelope(heading: string): ContentEnvelope {
  return {
    contractVersion: '1.1',
    data: {
      title: 'Casa Maíz',
      layout: [{blockType: 'textBlock', heading}],
    },
    preview: false,
    nextChangeAt: '2026-10-25T04:15:00.000Z',
  };
}

function renderHome(
  client: CmsClient,
  repository: ContentRepository = createContentRepository(createMemoryStore()),
  isOnline = true,
) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <NetworkStatusProvider isOnline={isOnline}>
          <CmsClientProvider client={client}>
            <ContentRepositoryProvider repository={repository}>
              <HomeScreen />
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

describe('HomeScreen', () => {
  const prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

  afterEach(() => {
    prefetch.mockClear();
  });

  afterAll(() => {
    prefetch.mockRestore();
  });

  it('shows a loading state before content arrives', () => {
    const getPage = jest.fn(
      () => new Promise<never>(() => undefined),
    ) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}));

    expect(tree.root.findByProps({testID: 'cms-loading-state'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'cms-appearance-control'})).toBeTruthy();
    expect(getPage).toHaveBeenCalledWith('home', expect.any(AbortSignal));
  });

  it('renders CMS layout after a successful load', async () => {
    let resolvePage: (value: ContentEnvelope) => void = () => undefined;
    const getPage = jest.fn(
      () =>
        new Promise(resolve => {
          resolvePage = resolve;
        }),
    ) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}));

    await ReactTestRenderer.act(async () => {
      resolvePage(pageEnvelope('Hola CMS'));
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Hola CMS');
    expect(() => tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();
  });

  it('prefetches page images after a successful load', async () => {
    const getPage = jest.fn().mockResolvedValue({
      contractVersion: '1.1',
      data: {
        title: 'Casa Maíz',
        layout: [
          {
            blockType: 'imageBlock',
            image: {url: 'https://cdn.example/home.webp'},
          },
        ],
      },
      preview: false,
    }) as CmsClient['getPage'];

    renderHome(mockClient({getPage}));
    await flush();

    expect(prefetch).toHaveBeenCalledWith('https://cdn.example/home.webp');
  });

  it('still renders the page when image prefetch fails', async () => {
    prefetch.mockRejectedValue(new Error('offline'));
    const getPage = jest.fn().mockResolvedValue(
      pageEnvelope('Sigue el menú'),
    ) as CmsClient['getPage'];

    const tree = renderHome(mockClient({getPage}));
    await flush();

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Sigue el menú');
  });

  it('keeps content on screen when connectivity drops, without its own banner', async () => {
    const getPage = jest
      .fn()
      .mockResolvedValue(pageEnvelope('Hola CMS')) as CmsClient['getPage'];
    const client = mockClient({getPage});
    const repository = createContentRepository(createMemoryStore());
    const tree = renderHome(client, repository, true);
    await flush();

    expect(() => tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();

    await ReactTestRenderer.act(() => {
      tree.update(
        <SafeAreaProvider initialMetrics={insets}>
          <NetworkStatusProvider isOnline={false}>
            <CmsClientProvider client={client}>
              <ContentRepositoryProvider repository={repository}>
                <HomeScreen />
              </ContentRepositoryProvider>
            </CmsClientProvider>
          </NetworkStatusProvider>
        </SafeAreaProvider>,
      );
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Hola CMS');
    expect(() => tree.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();
  });

  it('shows a retryable error and recovers when there is no cache', async () => {
    const getPage = jest
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(
        pageEnvelope('Después del retry'),
      ) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}));

    await flush();

    expect(tree.root.findByProps({testID: 'cms-error-state'})).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({accessibilityLabel: 'Reintentar'}).props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Después del retry');
  });
});
