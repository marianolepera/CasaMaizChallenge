import {Platform} from 'react-native';

export const DEFAULT_MARKET = 'MX' as const;
export const DEFAULT_AUDIENCE = 'guest' as const;
export const DEFAULT_APP_VERSION = '1.0.0';

export type MobilePlatform = 'ios' | 'android';
export type ContentMarket = typeof DEFAULT_MARKET;
export type ContentAudience = typeof DEFAULT_AUDIENCE;

export type ContentContext = {
  platform: MobilePlatform;
  market: ContentMarket;
  audience: ContentAudience;
  appVersion: string;
};

export type ContentQuery = {
  platform: MobilePlatform;
  market: ContentMarket;
  audience: ContentAudience;
  appVersion: string;
};

const SEMVER = /^\d+\.\d+\.\d+$/;

export function resolvePlatform(os: string): MobilePlatform {
  if (os === 'ios' || os === 'android') {
    return os;
  }

  throw new Error(`Unsupported content platform: ${os}`);
}

export function assertAppVersion(appVersion: string): string {
  if (!SEMVER.test(appVersion)) {
    throw new Error(
      `Invalid appVersion "${appVersion}". Use semantic version format such as 1.0.0.`,
    );
  }

  return appVersion;
}

export function createContentContext(input: {
  platform: string;
  appVersion: string;
}): ContentContext {
  return {
    platform: resolvePlatform(input.platform),
    market: DEFAULT_MARKET,
    audience: DEFAULT_AUDIENCE,
    appVersion: assertAppVersion(input.appVersion),
  };
}

export function toContentQuery(context: ContentContext): ContentQuery {
  return {
    platform: context.platform,
    market: context.market,
    audience: context.audience,
    appVersion: context.appVersion,
  };
}

export function contentQueryFromRuntime(input: {
  platform: string;
  appVersion: string;
}): ContentQuery {
  return toContentQuery(createContentContext(input));
}

export function getRuntimeContentQuery(): ContentQuery {
  return contentQueryFromRuntime({
    platform: Platform.OS,
    appVersion: DEFAULT_APP_VERSION,
  });
}
