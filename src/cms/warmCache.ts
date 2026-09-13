import {DEFAULT_API_BASE_URL} from '../config';
import type {ContentQuery} from '../config';
import type {ContentRepository} from '../repository/contentRepository';
import type {CmsClient, LegalKey, PageSlug} from './contentClient';
import {parseCmsPage} from './page';
import {prefetchPageImages} from './prefetchImages';

export const WARM_PAGE_SLUGS: PageSlug[] = ['menu'];
export const WARM_LEGAL_KEYS: LegalKey[] = ['privacy_policy'];

export async function warmSecondaryContent(
  client: CmsClient,
  repository: ContentRepository,
  context: ContentQuery,
  signal?: AbortSignal,
): Promise<void> {
  await Promise.allSettled([
    ...WARM_PAGE_SLUGS.map(slug =>
      warmPage(client, repository, context, slug, signal),
    ),
    ...WARM_LEGAL_KEYS.map(key =>
      warmLegal(client, repository, context, key, signal),
    ),
  ]);
}

async function warmPage(
  client: CmsClient,
  repository: ContentRepository,
  context: ContentQuery,
  slug: PageSlug,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) {
    return;
  }

  const envelope = await client.getPage(slug, signal);
  await repository.writePage(slug, context, envelope);
  await prefetchPageImages(parseCmsPage(envelope.data).layout, DEFAULT_API_BASE_URL);
}

async function warmLegal(
  client: CmsClient,
  repository: ContentRepository,
  context: ContentQuery,
  key: LegalKey,
  signal?: AbortSignal,
): Promise<void> {
  if (signal?.aborted) {
    return;
  }

  const envelope = await client.getLegal(key, signal);
  await repository.writeLegal(key, context, envelope);
}
