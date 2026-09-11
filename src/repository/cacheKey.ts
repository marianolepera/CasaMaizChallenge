import type {LegalKey, PageSlug} from '../cms/contentClient';
import type {ContentQuery} from '../config';

export type ContentCacheResource =
  | {kind: 'bootstrap'}
  | {kind: 'page'; slug: PageSlug}
  | {kind: 'legal'; key: LegalKey};

const CACHE_VERSION = 'v1';

export function contentCacheKey(
  resource: ContentCacheResource,
  context: ContentQuery,
): string {
  const id =
    resource.kind === 'page'
      ? resource.slug
      : resource.kind === 'legal'
        ? resource.key
        : undefined;

  return [
    'cms',
    CACHE_VERSION,
    resource.kind,
    ...(id ? [id] : []),
    context.platform,
    context.market,
    context.audience,
    context.appVersion,
  ].join(':');
}
