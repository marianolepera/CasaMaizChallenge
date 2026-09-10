import {createCmsClient} from '../cms/contentClient';

const BASE_URL = 'https://payload-cms-poc-seven.vercel.app';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

function envelope(data: Record<string, unknown> = {ok: true}) {
  return {
    contractVersion: '1.1',
    data,
    preview: false,
    resolvedContext: {
      appVersion: '1.0.0',
      authenticationState: 'guest',
      market: 'MX',
      now: '2026-09-10T19:27:32.290Z',
      platform: 'ios',
    },
  };
}

describe('CMS client', () => {
  it('adds required content context to bootstrap requests', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn,
      getPlatform: () => 'ios',
      getAppVersion: () => '1.0.0',
    });

    const result = await client.getBootstrap();

    expect(result.contractVersion).toBe('1.1');
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe(
      `${BASE_URL}/api/content/v1/bootstrap?platform=ios&market=MX&audience=guest&appVersion=1.0.0`,
    );
  });

  it('derives android platform from runtime, not from screens', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn,
      getPlatform: () => 'android',
      getAppVersion: () => '1.0.0',
    });

    await client.getPage('menu');

    expect(fetchFn.mock.calls[0][0]).toBe(
      `${BASE_URL}/api/content/v1/pages/menu?platform=android&market=MX&audience=guest&appVersion=1.0.0`,
    );
  });

  it('fetches home, menu, and privacy through the same client', async () => {
    const fetchFn = jest
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse(envelope())));
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn,
      getPlatform: () => 'ios',
      getAppVersion: () => '1.0.0',
    });

    await client.getPage('home');
    await client.getLegal('privacy_policy');

    expect(fetchFn.mock.calls[0][0]).toContain('/api/content/v1/pages/home?');
    expect(fetchFn.mock.calls[1][0]).toContain(
      '/api/content/v1/legal/privacy_policy?',
    );
  });

  it('rejects an incompatible contract version', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse({...envelope(), contractVersion: '2.0'}),
    );
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn,
      getPlatform: () => 'ios',
      getAppVersion: () => '1.0.0',
    });

    await expect(client.getBootstrap()).rejects.toEqual(
      expect.objectContaining({kind: 'unsupportedContract'}),
    );
  });

  it('resolves relative media against the client base URL', () => {
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn: jest.fn(),
      getPlatform: () => 'ios',
      getAppVersion: () => '1.0.0',
    });

    expect(client.resolveMediaUrl('/api/media/file/hero.webp')).toBe(
      `${BASE_URL}/api/media/file/hero.webp`,
    );
  });

  it('forwards abort signals to fetch', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(envelope()));
    const client = createCmsClient({
      baseUrl: BASE_URL,
      fetchFn,
      getPlatform: () => 'ios',
      getAppVersion: () => '1.0.0',
    });
    const signal = new AbortController().signal;

    await client.getBootstrap(signal);

    expect(fetchFn.mock.calls[0][1]).toEqual(
      expect.objectContaining({signal}),
    );
  });
});
