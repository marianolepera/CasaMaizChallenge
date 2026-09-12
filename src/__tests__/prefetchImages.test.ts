import {DEFAULT_API_BASE_URL} from '../config/api';
import {collectPageImageUrls, prefetchPageImages} from '../cms/prefetchImages';

describe('collectPageImageUrls', () => {
  it('resolves the same media the blocks render and skips incomplete items', () => {
    expect(
      collectPageImageUrls(
        [
          {
            blockType: 'restaurantHero',
            image: {
              url: 'https://cdn.example/hero.webp',
              sizes: {
                medium: {url: 'https://cdn.example/hero-900.webp'},
              },
            },
          },
          {
            blockType: 'imageBlock',
            image: {url: 'https://cdn.example/desktop.webp'},
            mobileImage: {url: 'https://cdn.example/mobile.webp'},
          },
          {
            blockType: 'cardGrid',
            cards: [
              {title: 'Elote', image: {url: '/api/media/file/elote.webp'}},
              {title: 'Sin foto'},
            ],
          },
          {
            blockType: 'carousel',
            slides: [{image: {url: 'https://cdn.example/slide.webp'}}],
          },
          {
            blockType: 'promoRail',
            promotions: [
              {
                mobileImage: {url: 'https://cdn.example/promo-mobile.webp'},
                desktopImage: {url: 'https://cdn.example/promo-desktop.webp'},
              },
            ],
          },
          {blockType: 'textBlock', heading: 'Sin media'},
          {blockType: 'imageBlock'},
        ],
        DEFAULT_API_BASE_URL,
      ),
    ).toEqual([
      'https://cdn.example/hero-900.webp',
      'https://cdn.example/mobile.webp',
      `${DEFAULT_API_BASE_URL}/api/media/file/elote.webp`,
      'https://cdn.example/slide.webp',
      'https://cdn.example/promo-mobile.webp',
    ]);
  });

  it('deduplicates the same resolved URI', () => {
    expect(
      collectPageImageUrls(
        [
          {
            blockType: 'imageBlock',
            image: {url: 'https://cdn.example/repeat.webp'},
          },
          {
            blockType: 'carousel',
            slides: [{image: {url: 'https://cdn.example/repeat.webp'}}],
          },
        ],
        DEFAULT_API_BASE_URL,
      ),
    ).toEqual(['https://cdn.example/repeat.webp']);
  });
});

describe('prefetchPageImages', () => {
  it('prefetches collected URIs through the injected helper', async () => {
    const prefetch = jest.fn().mockResolvedValue(true);

    await prefetchPageImages(
      [
        {blockType: 'imageBlock', image: {url: 'https://cdn.example/a.webp'}},
        {blockType: 'carousel', slides: [{image: {url: 'https://cdn.example/b.webp'}}]},
      ],
      DEFAULT_API_BASE_URL,
      prefetch,
    );

    expect(prefetch.mock.calls.map(call => call[0])).toEqual([
      'https://cdn.example/a.webp',
      'https://cdn.example/b.webp',
    ]);
  });

  it('does not throw when a prefetch fails', async () => {
    const prefetch = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('offline'));

    await expect(
      prefetchPageImages(
        [
          {blockType: 'imageBlock', image: {url: 'https://cdn.example/ok.webp'}},
          {blockType: 'imageBlock', image: {url: 'https://cdn.example/fail.webp'}},
        ],
        DEFAULT_API_BASE_URL,
        prefetch,
      ),
    ).resolves.toBeUndefined();

    expect(prefetch).toHaveBeenCalledTimes(2);
  });
});
