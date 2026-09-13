import {networkError} from '../api/errors';
import type {CmsClient} from '../cms/contentClient';
import {warmSecondaryContent} from '../cms/warmCache';
import {DEFAULT_APP_VERSION, contentQueryFromRuntime} from '../config';
import {contentCacheKey} from '../repository/cacheKey';
import {createContentRepository} from '../repository/contentRepository';
import {createMemoryStore} from '../repository/memoryStorage';

const context = contentQueryFromRuntime({
  platform: 'ios',
  appVersion: DEFAULT_APP_VERSION,
});

function envelope(title: string) {
  return {
    contractVersion: '1.1' as const,
    data: {title, layout: [{blockType: 'textBlock', heading: title}]},
    preview: false,
    nextChangeAt: '2026-10-25T04:15:00.000Z',
  };
}

function mockClient(overrides: Partial<CmsClient> = {}): CmsClient {
  return {
    getBootstrap: jest.fn(),
    getPage: jest.fn().mockResolvedValue(envelope('Menú')),
    getLegal: jest.fn().mockResolvedValue({
      contractVersion: '1.1',
      data: {title: 'Privacidad'},
      preview: false,
    }),
    resolveMediaUrl: jest.fn(),
    ...overrides,
  };
}

describe('warmSecondaryContent', () => {
  it('persists menu and privacy so they can render offline', async () => {
    const store = createMemoryStore();
    const repository = createContentRepository(store);
    const client = mockClient();

    await warmSecondaryContent(client, repository, context);

    expect(client.getPage).toHaveBeenCalledWith('menu', undefined);
    expect(client.getLegal).toHaveBeenCalledWith('privacy_policy', undefined);
    expect(
      await store.getItem(
        contentCacheKey({kind: 'page', slug: 'menu'}, context),
      ),
    ).toContain('Menú');
    expect(
      await store.getItem(
        contentCacheKey({kind: 'legal', key: 'privacy_policy'}, context),
      ),
    ).toContain('Privacidad');
  });

  it('does not throw when a warm request fails', async () => {
    const repository = createContentRepository(createMemoryStore());
    const client = mockClient({
      getPage: jest.fn().mockRejectedValue(networkError()) as CmsClient['getPage'],
      getLegal: jest.fn().mockRejectedValue(networkError()) as CmsClient['getLegal'],
    });

    await expect(
      warmSecondaryContent(client, repository, context),
    ).resolves.toBeUndefined();
  });

  it('skips work when the bootstrap request was aborted', async () => {
    const client = mockClient();
    const repository = createContentRepository(createMemoryStore());
    const controller = new AbortController();
    controller.abort();

    await warmSecondaryContent(client, repository, context, controller.signal);

    expect(client.getPage).not.toHaveBeenCalled();
    expect(client.getLegal).not.toHaveBeenCalled();
  });
});
