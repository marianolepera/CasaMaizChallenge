import type {LegalKey, PageSlug} from '../cms/contentClient';
import {parseContentEnvelope} from '../cms/envelope';
import type {ContentEnvelope} from '../cms/envelope';
import type {ContentQuery} from '../config';
import {isCacheValid, shouldPersistEnvelope} from './cacheExpiry';
import {contentCacheKey} from './cacheKey';
import type {ContentCacheResource} from './cacheKey';
import type {KeyValueStore} from './storage';

export type CacheReadOptions = {
  now?: Date;
};

export type CacheWriteOptions = {
  now?: Date;
};

export type CacheReadResult =
  | {status: 'hit'; envelope: ContentEnvelope}
  | {status: 'miss'}
  | {status: 'expired'};

export type ContentRepository = {
  read: (
    resource: ContentCacheResource,
    context: ContentQuery,
    options?: CacheReadOptions,
  ) => Promise<CacheReadResult>;
  write: (
    resource: ContentCacheResource,
    context: ContentQuery,
    envelope: ContentEnvelope,
    options?: CacheWriteOptions,
  ) => Promise<void>;
  readPage: (
    slug: PageSlug,
    context: ContentQuery,
    options?: CacheReadOptions,
  ) => Promise<CacheReadResult>;
  writePage: (
    slug: PageSlug,
    context: ContentQuery,
    envelope: ContentEnvelope,
    options?: CacheWriteOptions,
  ) => Promise<void>;
  readBootstrap: (
    context: ContentQuery,
    options?: CacheReadOptions,
  ) => Promise<CacheReadResult>;
  writeBootstrap: (
    context: ContentQuery,
    envelope: ContentEnvelope,
    options?: CacheWriteOptions,
  ) => Promise<void>;
  readLegal: (
    key: LegalKey,
    context: ContentQuery,
    options?: CacheReadOptions,
  ) => Promise<CacheReadResult>;
  writeLegal: (
    key: LegalKey,
    context: ContentQuery,
    envelope: ContentEnvelope,
    options?: CacheWriteOptions,
  ) => Promise<void>;
};

export function createContentRepository(store: KeyValueStore): ContentRepository {
  const read = async (
    resource: ContentCacheResource,
    context: ContentQuery,
    options?: CacheReadOptions,
  ): Promise<CacheReadResult> => {
    const key = contentCacheKey(resource, context);
    const raw = await store.getItem(key);

    if (raw == null) {
      return {status: 'miss'};
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      await store.removeItem(key);
      return {status: 'miss'};
    }

    let envelope: ContentEnvelope;
    try {
      envelope = parseContentEnvelope(parsedJson);
    } catch {
      await store.removeItem(key);
      return {status: 'miss'};
    }

    if (!isCacheValid(envelope, options?.now ?? new Date())) {
      return {status: 'expired'};
    }

    return {status: 'hit', envelope};
  };

  const write = async (
    resource: ContentCacheResource,
    context: ContentQuery,
    envelope: ContentEnvelope,
    options?: CacheWriteOptions,
  ): Promise<void> => {
    if (!shouldPersistEnvelope(envelope, options?.now ?? new Date())) {
      return;
    }

    await store.setItem(
      contentCacheKey(resource, context),
      JSON.stringify(envelope),
    );
  };

  return {
    read,
    write,
    readPage(slug, context, options) {
      return read({kind: 'page', slug}, context, options);
    },
    writePage(slug, context, envelope, options) {
      return write({kind: 'page', slug}, context, envelope, options);
    },
    readBootstrap(context, options) {
      return read({kind: 'bootstrap'}, context, options);
    },
    writeBootstrap(context, envelope, options) {
      return write({kind: 'bootstrap'}, context, envelope, options);
    },
    readLegal(key, context, options) {
      return read({kind: 'legal', key}, context, options);
    },
    writeLegal(key, context, envelope, options) {
      return write({kind: 'legal', key}, context, envelope, options);
    },
  };
}
