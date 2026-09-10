import {DEFAULT_API_BASE_URL} from '../config/api';
import {resolveCmsImage, resolveMediaUrl} from '../cms/media';

describe('resolveMediaUrl', () => {
  it('keeps absolute CDN URLs unchanged', () => {
    expect(
      resolveMediaUrl(
        'https://d2y8b8r86vndtb.cloudfront.net/image-hero1-6.webp',
        DEFAULT_API_BASE_URL,
      ),
    ).toBe('https://d2y8b8r86vndtb.cloudfront.net/image-hero1-6.webp');
  });

  it('joins relative Payload media paths to the API base URL', () => {
    expect(
      resolveMediaUrl('/api/media/file/menu.webp', `${DEFAULT_API_BASE_URL}/`),
    ).toBe(`${DEFAULT_API_BASE_URL}/api/media/file/menu.webp`);
  });

  it('reads url from a CMS media object', () => {
    expect(
      resolveMediaUrl(
        {
          url: '/api/media/file/hero.webp',
          filename: 'hero.webp',
          extra: {ignored: true},
        },
        DEFAULT_API_BASE_URL,
      ),
    ).toBe(`${DEFAULT_API_BASE_URL}/api/media/file/hero.webp`);
  });

  it('falls back to filename when url is missing', () => {
    expect(
      resolveMediaUrl({filename: 'hero.webp'}, DEFAULT_API_BASE_URL),
    ).toBe(`${DEFAULT_API_BASE_URL}/api/media/file/hero.webp`);
  });

  it('returns undefined for malformed or incomplete media', () => {
    expect(resolveMediaUrl(null, DEFAULT_API_BASE_URL)).toBeUndefined();
    expect(resolveMediaUrl({}, DEFAULT_API_BASE_URL)).toBeUndefined();
    expect(resolveMediaUrl({url: ''}, DEFAULT_API_BASE_URL)).toBeUndefined();
    expect(resolveMediaUrl({url: 123}, DEFAULT_API_BASE_URL)).toBeUndefined();
  });

  it('picks a mobile-sized derivative and keeps alt text', () => {
    expect(
      resolveCmsImage(
        {
          alt: 'Hero',
          url: 'https://cdn.example/hero.webp',
          width: 3200,
          height: 1800,
          sizes: {
            medium: {
              url: 'https://cdn.example/hero-900.webp',
              width: 900,
              height: 506,
            },
          },
        },
        DEFAULT_API_BASE_URL,
      ),
    ).toEqual({
      uri: 'https://cdn.example/hero-900.webp',
      alt: 'Hero',
      aspectRatio: 900 / 506,
    });
  });
});
