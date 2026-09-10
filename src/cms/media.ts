import {normalizeApiBaseUrl} from '../config/api';

const ABSOLUTE_URL = /^https?:\/\//i;
const PREFERRED_SIZE_KEYS = ['medium', 'small', 'large', 'thumbnail'] as const;

export type ResolvedCmsImage = {
  uri: string;
  alt?: string;
  aspectRatio: number;
};

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

export function resolveCmsImage(
  source: unknown,
  baseUrl: string,
): ResolvedCmsImage | undefined {
  if (typeof source !== 'object' || source === null) {
    const uri = resolveMediaUrl(source, baseUrl);
    return uri ? {uri, aspectRatio: 16 / 9} : undefined;
  }

  const media = source as Record<string, unknown>;
  const sized = pickSizedMedia(media) ?? media;
  const uri = resolveMediaUrl(sized, baseUrl);
  if (!uri) {
    return undefined;
  }

  const width = readFiniteNumber(sized.width) ?? readFiniteNumber(media.width);
  const height =
    readFiniteNumber(sized.height) ?? readFiniteNumber(media.height);
  const alt =
    (typeof media.alt === 'string' && media.alt.trim()) || undefined;

  return {
    uri,
    alt,
    aspectRatio: width && height && height > 0 ? width / height : 16 / 9,
  };
}

function pickSizedMedia(
  media: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (typeof media.sizes !== 'object' || media.sizes === null) {
    return undefined;
  }

  const sizes = media.sizes as Record<string, unknown>;
  for (const key of PREFERRED_SIZE_KEYS) {
    const candidate = sizes[key];
    if (typeof candidate === 'object' && candidate !== null) {
      return candidate as Record<string, unknown>;
    }
  }

  return undefined;
}

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
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
