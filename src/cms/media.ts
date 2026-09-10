import {normalizeApiBaseUrl} from '../config/api';

const ABSOLUTE_URL = /^https?:\/\//i;

export function resolveMediaUrl(
  source: unknown,
  baseUrl: string,
): string | undefined {
  if (typeof source === 'string') {
    return resolveUrlString(source, baseUrl);
  }

  if (typeof source !== 'object' || source === null) {
    return undefined;
  }

  const media = source as {url?: unknown; filename?: unknown};

  if (typeof media.url === 'string') {
    const fromUrl = resolveUrlString(media.url, baseUrl);
    if (fromUrl) {
      return fromUrl;
    }
  }

  if (typeof media.filename === 'string' && media.filename.trim()) {
    return resolveUrlString(
      `/api/media/file/${media.filename.trim()}`,
      baseUrl,
    );
  }

  return undefined;
}

function resolveUrlString(value: string, baseUrl: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (ABSOLUTE_URL.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const origin = normalizeApiBaseUrl(baseUrl);
  return trimmed.startsWith('/') ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}
