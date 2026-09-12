import {resolveDestination, type ResolvedDestination} from './destinations';

export const DEEP_LINK_SCHEME = 'casamaiz';

export function parseDeepLink(url: string): ResolvedDestination {
  const path = extractDeepLinkPath(url);
  if (!path) {
    return {kind: 'unsupported', reason: 'unrecognized-destination'};
  }

  return (
    resolveDestination(path) ?? {
      kind: 'unsupported',
      reason: 'unrecognized-destination',
    }
  );
}

export function extractDeepLinkPath(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return undefined;
  }

  if (parsed.protocol !== `${DEEP_LINK_SCHEME}:`) {
    return undefined;
  }

  const host = parsed.hostname;
  const pathname = parsed.pathname.replace(/\/+$/, '');
  const combined =
    host && pathname && pathname !== '/'
      ? `/${host}${pathname}`
      : host
        ? `/${host}`
        : pathname || '/';

  return combined === '' ? '/' : combined;
}
