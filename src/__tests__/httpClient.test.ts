import {isAbortError} from '../api/errors';
import {createHttpClient} from '../api/httpClient';

const BASE_URL = 'https://payload-cms-poc-seven.vercel.app';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

describe('http client', () => {
  it('returns parsed JSON for a successful response', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse({ok: true}),
    );
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    await expect(client.getJson('/api/content/v1/bootstrap')).resolves.toEqual({
      ok: true,
    });
    expect(fetchFn).toHaveBeenCalledWith(
      `${BASE_URL}/api/content/v1/bootstrap`,
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('appends query parameters to the request URL', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ok: true}));
    const client = createHttpClient({baseUrl: `${BASE_URL}/`, fetchFn});

    await client.getJson('/api/content/v1/bootstrap', {
      query: {
        platform: 'ios',
        market: 'MX',
        audience: 'guest',
        appVersion: '1.0.0',
      },
    });

    expect(fetchFn.mock.calls[0][0]).toBe(
      `${BASE_URL}/api/content/v1/bootstrap?platform=ios&market=MX&audience=guest&appVersion=1.0.0`,
    );
  });

  it('maps HTTP errors to a user-safe CmsError and keeps technical context', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse({error: 'internal boom'}, 500),
    );
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    await expect(client.getJson('/api/content/v1/bootstrap')).rejects.toEqual(
      expect.objectContaining({
        name: 'CmsError',
        kind: 'http',
        status: 500,
        retryable: true,
        userMessage: 'Algo salió mal. Intentá de nuevo.',
        technicalMessage: 'HTTP 500: internal boom',
      }),
    );
  });

  it('reads an errors array from the CMS payload', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse({errors: [{message: 'Page not found'}]}, 404),
    );
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    await expect(client.getJson('/api/content/v1/pages/missing')).rejects.toEqual(
      expect.objectContaining({
        kind: 'http',
        status: 404,
        retryable: false,
        userMessage: 'No encontramos este contenido.',
        technicalMessage: 'HTTP 404: Page not found',
      }),
    );
  });

  it('fails safely on malformed JSON', async () => {
    const fetchFn = jest.fn().mockImplementation(() =>
      Promise.resolve(new Response('{not-json', {status: 200})),
    );
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    await expect(client.getJson('/api/content/v1/bootstrap')).rejects.toEqual(
      expect.objectContaining({
        name: 'CmsError',
        kind: 'malformed',
        retryable: false,
      }),
    );
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('maps transport failures to a retryable network error', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    await expect(client.getJson('/api/content/v1/bootstrap')).rejects.toEqual(
      expect.objectContaining({
        kind: 'network',
        retryable: true,
        userMessage: 'No pudimos conectar. Revisá tu conexión e intentá de nuevo.',
      }),
    );
  });

  it('propagates abort errors so callers can ignore stale responses', async () => {
    const fetchFn = jest.fn().mockRejectedValue(
      Object.assign(new Error('Aborted'), {name: 'AbortError'}),
    );
    const client = createHttpClient({baseUrl: BASE_URL, fetchFn});

    try {
      await client.getJson('/api/content/v1/bootstrap');
      throw new Error('expected abort');
    } catch (error) {
      expect(isAbortError(error)).toBe(true);
      expect(error).not.toEqual(expect.objectContaining({kind: 'network'}));
    }
  });
});
