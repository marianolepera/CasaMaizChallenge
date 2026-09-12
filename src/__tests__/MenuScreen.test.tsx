import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';
import {
  MENU_SEARCH_ICON_TEST_ID,
  MENU_SEARCH_INPUT_TEST_ID,
} from '../screens/CmsPageScreen';
import type {CmsClient} from '../cms/contentClient';
import type {ContentEnvelope} from '../cms/envelope';
import {CmsClientProvider} from '../cms/CmsClientProvider';
import {createContentRepository} from '../repository/contentRepository';
import {ContentRepositoryProvider} from '../repository/ContentRepositoryProvider';
import {createMemoryStore} from '../repository/memoryStorage';
import {MenuScreen} from '../screens/MenuScreen';

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

function cardTitles(tree: ReactTestRenderer.ReactTestRenderer) {
  return [
    ...new Set(
      tree.root
        .findAllByProps({testID: 'cms-card-title'})
        .map(node => node.props.children)
        .filter((value): value is string => typeof value === 'string'),
    ),
  ];
}

function renderMenu(client: CmsClient) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <CmsClientProvider client={client}>
          <ContentRepositoryProvider
            repository={createContentRepository(createMemoryStore())}>
            <MenuScreen />
          </ContentRepositoryProvider>
        </CmsClientProvider>
      </SafeAreaProvider>,
    );
  });
  return tree!;
}

describe('MenuScreen', () => {
  it('loads the menu page and renders CMS layout', async () => {
    const envelope: ContentEnvelope = {
      contractVersion: '1.1',
      data: {
        title: 'Menu',
        layout: [
          {blockType: 'textBlock', heading: 'From the milpa to the table'},
          {
            blockType: 'imageBlock',
            caption: 'Este es un ejemplo',
            image: {url: 'https://cdn.example/menu.webp', alt: 'plato'},
          },
        ],
      },
      preview: false,
    };
    const getPage = jest.fn().mockResolvedValue(envelope) as CmsClient['getPage'];
    const tree = renderMenu(mockClient({getPage}));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getPage).toHaveBeenCalledWith('menu', expect.any(AbortSignal));
    expect(tree.root.findByProps({testID: 'menu-screen'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('From the milpa to the table');
    expect(tree.root.findByProps({testID: 'cms-image-block'})).toBeTruthy();
    expect(tree.root.findByProps({testID: MENU_SEARCH_INPUT_TEST_ID})).toBeTruthy();
    expect(tree.root.findByProps({testID: MENU_SEARCH_ICON_TEST_ID})).toBeTruthy();
  });

  it('filters CMS menu dishes as the guest types', async () => {
    const envelope: ContentEnvelope = {
      contractVersion: '1.1',
      data: {
        title: 'Menu',
        layout: [
          {
            blockType: 'cardGrid',
            title: 'De la milpa',
            cards: [
              {title: 'Esquites', price: '$90'},
              {title: 'Tacos de suadero', price: '$140'},
            ],
          },
        ],
      },
      preview: false,
    };
    const tree = renderMenu(
      mockClient({
        getPage: jest.fn().mockResolvedValue(envelope) as CmsClient['getPage'],
      }),
    );

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(cardTitles(tree)).toEqual(['Esquites', 'Tacos de suadero']);

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({testID: MENU_SEARCH_INPUT_TEST_ID}).props.onChangeText(
        'esquites',
      );
    });

    expect(cardTitles(tree)).toEqual(['Esquites']);
  });
});
