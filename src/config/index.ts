export {
  DEFAULT_API_BASE_URL,
  normalizeApiBaseUrl,
} from './api';
export {
  DEFAULT_APP_VERSION,
  DEFAULT_AUDIENCE,
  DEFAULT_MARKET,
  assertAppVersion,
  contentQueryFromRuntime,
  createContentContext,
  getRuntimeContentQuery,
  resolvePlatform,
  toContentQuery,
} from './contentContext';
export type {
  ContentAudience,
  ContentContext,
  ContentMarket,
  ContentQuery,
  MobilePlatform,
} from './contentContext';
