import {Image} from 'react-native';
import {readArray, readObject} from './fields';
import {resolveCmsImage} from './media';
import type {CmsBlock} from './page';

export type PrefetchImage = (uri: string) => Promise<boolean | void>;

export async function prefetchPageImages(
  layout: CmsBlock[],
  baseUrl: string,
  prefetch: PrefetchImage = uri => Image.prefetch(uri),
): Promise<void> {
  try {
    const uris = collectPageImageUrls(layout, baseUrl);
    await Promise.allSettled(
      uris.map(uri =>
        Promise.resolve()
          .then(() => prefetch(uri))
          .catch(() => undefined),
      ),
    );
  } catch {
    // Prefetch is best-effort and must not break page render.
  }
}

export function collectPageImageUrls(
  layout: CmsBlock[],
  baseUrl: string,
): string[] {
  const uris: string[] = [];
  const seen = new Set<string>();

  for (const block of layout) {
    for (const media of collectBlockMedia(block)) {
      const resolved = resolveCmsImage(media, baseUrl);
      if (!resolved || seen.has(resolved.uri)) {
        continue;
      }

      seen.add(resolved.uri);
      uris.push(resolved.uri);
    }
  }

  return uris;
}

function collectBlockMedia(block: CmsBlock): unknown[] {
  switch (block.blockType) {
    case 'restaurantHero':
      return [block.image];
    case 'imageBlock':
      return [block.mobileImage ?? block.image];
    case 'cardGrid':
      return readArray(block.cards).map(card => readObject(card)?.image);
    case 'carousel':
      return readArray(block.slides).map(slide => readObject(slide)?.image);
    case 'promoRail':
      return readArray(block.promotions).map(item => {
        const promo = readObject(item);
        return promo?.mobileImage ?? promo?.desktopImage;
      });
    default:
      return [];
  }
}
