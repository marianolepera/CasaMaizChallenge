import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {networkError} from '../api/errors';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
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

function renderHome(client: CmsClient) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <CmsClientProvider client={client}>
          <HomeScreen />
        </CmsClientProvider>
      </SafeAreaProvider>,
    );
  });
  return tree!;
}

describe('HomeScreen', () => {
  it('shows a loading state before content arrives', () => {
    const getPage = jest.fn(
      () => new Promise<never>(() => undefined),
    ) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}));

    expect(tree.root.findByProps({testID: 'cms-loading-state'})).toBeTruthy();
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
      resolvePage({
        contractVersion: '1.1',
        data: {
          title: 'Casa Maíz',
          layout: [{blockType: 'textBlock', heading: 'Hola CMS'}],
        },
      });
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Hola CMS');
  });

  it('shows a retryable error and recovers', async () => {
    const getPage = jest
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce({
        contractVersion: '1.1',
        data: {
          layout: [{blockType: 'textBlock', heading: 'Después del retry'}],
        },
      }) as CmsClient['getPage'];
    const tree = renderHome(mockClient({getPage}));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(tree.root.findByProps({testID: 'cms-error-state'})).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({accessibilityLabel: 'Reintentar'}).props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Después del retry');
  });
});
