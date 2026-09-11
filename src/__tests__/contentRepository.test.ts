import {SUPPORTED_CONTRACT_VERSION} from '../cms/contract';
import type {ContentEnvelope} from '../cms/envelope';
import type {ContentQuery} from '../config';
import {contentCacheKey} from '../repository/cacheKey';
import {createContentRepository} from '../repository/contentRepository';
import {createMemoryStore} from '../repository/memoryStorage';

const context: ContentQuery = {
  platform: 'ios',
  market: 'MX',
  audience: 'guest',
  appVersion: '1.0.0',
};

const now = new Date('2026-09-11T12:00:00.000Z');

function envelope(
  overrides: Partial<ContentEnvelope> = {},
): ContentEnvelope {
  return {
    contractVersion: SUPPORTED_CONTRACT_VERSION,
    data: {slug: 'home', layout: [{blockType: 'textBlock', heading: 'Casa'}]},
    nextChangeAt: '2026-09-12T00:00:00.000Z',
    preview: false,
    ...overrides,
  };
}

describe('content cache keys', () => {
  it('scopes keys by resource and query context', () => {
    expect(contentCacheKey({kind: 'page', slug: 'home'}, context)).toBe(
      'cms:v1:page:home:ios:MX:guest:1.0.0',
    );
    expect(contentCacheKey({kind: 'bootstrap'}, context)).toBe(
      'cms:v1:bootstrap:ios:MX:guest:1.0.0',
    );
    expect(
      contentCacheKey({kind: 'legal', key: 'privacy_policy'}, context),
    ).toBe('cms:v1:legal:privacy_policy:ios:MX:guest:1.0.0');
  });

  it('does not mix platforms or app versions', () => {
    expect(
      contentCacheKey(
        {kind: 'page', slug: 'home'},
        {...context, platform: 'android', appVersion: '1.1.0'},
      ),
    ).toBe('cms:v1:page:home:android:MX:guest:1.1.0');
  });
});

describe('content repository', () => {
  it('returns miss when nothing has been stored', async () => {
    const repository = createContentRepository(createMemoryStore());

    await expect(
      repository.readPage('home', context, {now}),
    ).resolves.toEqual({status: 'miss'});
  });

  it('writes a successful envelope and reads it back as a hit', async () => {
    const repository = createContentRepository(createMemoryStore());
    const stored = envelope();

    await repository.writePage('home', context, stored, {now});

    await expect(
      repository.readPage('home', context, {now}),
    ).resolves.toEqual({status: 'hit', envelope: stored});
  });

  it('keeps page, bootstrap, and legal entries isolated', async () => {
    const repository = createContentRepository(createMemoryStore());

    await repository.writePage('home', context, envelope(), {now});
    await repository.writeBootstrap(
      context,
      envelope({data: {navigation: {items: []}}}),
      {now},
    );

    await expect(
      repository.readLegal('privacy_policy', context, {now}),
    ).resolves.toEqual({status: 'miss'});
    await expect(
      repository.readPage('menu', context, {now}),
    ).resolves.toEqual({status: 'miss'});
    await expect(repository.readBootstrap(context, {now})).resolves.toEqual({
      status: 'hit',
      envelope: envelope({data: {navigation: {items: []}}}),
    });
  });

  it('does not persist preview envelopes', async () => {
    const repository = createContentRepository(createMemoryStore());

    await repository.writePage(
      'home',
      context,
      envelope({preview: true}),
      {now},
    );

    await expect(
      repository.readPage('home', context, {now}),
    ).resolves.toEqual({status: 'miss'});
  });

  it('does not serve cached content after nextChangeAt', async () => {
    const repository = createContentRepository(createMemoryStore());

    await repository.writePage(
      'home',
      context,
      envelope({nextChangeAt: '2026-09-11T18:00:00.000Z'}),
      {now},
    );

    await expect(
      repository.readPage('home', context, {
        now: new Date('2026-09-11T18:00:00.000Z'),
      }),
    ).resolves.toEqual({status: 'expired'});
  });

  it('treats malformed stored JSON as a miss and removes it', async () => {
    const store = createMemoryStore();
    const repository = createContentRepository(store);
    const key = contentCacheKey({kind: 'page', slug: 'home'}, context);

    await store.setItem(key, '{not-json');

    await expect(
      repository.readPage('home', context, {now}),
    ).resolves.toEqual({status: 'miss'});
    await expect(store.getItem(key)).resolves.toBeNull();
  });

  it('treats an unsupported stored contract as a miss and removes it', async () => {
    const store = createMemoryStore();
    const repository = createContentRepository(store);
    const key = contentCacheKey({kind: 'page', slug: 'home'}, context);

    await store.setItem(
      key,
      JSON.stringify(envelope({contractVersion: '2.0' as '1.1'})),
    );

    await expect(
      repository.readPage('home', context, {now}),
    ).resolves.toEqual({status: 'miss'});
    await expect(store.getItem(key)).resolves.toBeNull();
  });
});
