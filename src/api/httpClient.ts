import {normalizeApiBaseUrl} from '../config/api';
import {
  httpError,
  isAbortError,
  malformedError,
  networkError,
} from './errors';

export type QueryParams = Record<string, string>;

export type HttpRequestOptions = {
  signal?: AbortSignal;
  query?: QueryParams;
};

export type HttpClient = {
  getJson: (path: string, options?: HttpRequestOptions) => Promise<unknown>;
};

export function createHttpClient(input: {
  baseUrl: string;
  fetchFn?: typeof fetch;
}): HttpClient {
  const baseUrl = normalizeApiBaseUrl(input.baseUrl);
  const fetchFn = input.fetchFn ?? fetch;

  return {
    getJson(path, options) {
      return requestJson(fetchFn, buildUrl(baseUrl, path, options?.query), {
        method: 'GET',
        signal: options?.signal,
        headers: {Accept: 'application/json'},
      });
    },
  };
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: QueryParams,
): string {
  const pathname = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${pathname}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function requestJson(
  fetchFn: typeof fetch,
  url: string,
  init: RequestInit,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetchFn(url, init);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw networkError(error);
  }

  const body = await readJsonBody(response);

  if (!response.ok) {
    throw httpError(response.status, body);
  }

  if (body === undefined) {
    throw malformedError();
  }

  return body;
}

async function readJsonBody(response: Response): Promise<unknown> {
  let text: string;

  try {
    text = await response.text();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw malformedError(error);
  }

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw malformedError(error);
  }
}
