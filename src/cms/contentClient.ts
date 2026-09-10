import {Platform} from 'react-native';
import {createHttpClient} from '../api/httpClient';
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_APP_VERSION,
  contentQueryFromRuntime,
} from '../config';
import {parseContentEnvelope} from './envelope';
import type {ContentEnvelope} from './envelope';
import {resolveMediaUrl} from './media';

export type PageSlug = 'home' | 'menu';
export type LegalKey = 'privacy_policy';

export type CmsClient = {
  getBootstrap: (signal?: AbortSignal) => Promise<ContentEnvelope>;
  getPage: (slug: PageSlug, signal?: AbortSignal) => Promise<ContentEnvelope>;
  getLegal: (key: LegalKey, signal?: AbortSignal) => Promise<ContentEnvelope>;
  resolveMediaUrl: (source: unknown) => string | undefined;
};

export type CmsClientOptions = {
  baseUrl?: string;
  getPlatform?: () => string;
  getAppVersion?: () => string;
  fetchFn?: typeof fetch;
};

export function createCmsClient(options: CmsClientOptions = {}): CmsClient {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
  const getPlatform = options.getPlatform ?? (() => Platform.OS);
  const getAppVersion = options.getAppVersion ?? (() => DEFAULT_APP_VERSION);
  const http = createHttpClient({baseUrl, fetchFn: options.fetchFn});

  const getContent = async (path: string, signal?: AbortSignal) => {
    const query = contentQueryFromRuntime({
      platform: getPlatform(),
      appVersion: getAppVersion(),
    });
    const body = await http.getJson(path, {query, signal});
    return parseContentEnvelope(body);
  };

  return {
    getBootstrap(signal) {
      return getContent('/api/content/v1/bootstrap', signal);
    },
    getPage(slug, signal) {
      return getContent(`/api/content/v1/pages/${slug}`, signal);
    },
    getLegal(key, signal) {
      return getContent(`/api/content/v1/legal/${key}`, signal);
    },
    resolveMediaUrl(source) {
      return resolveMediaUrl(source, baseUrl);
    },
  };
}
