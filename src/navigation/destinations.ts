import {Alert, Linking} from 'react-native';
import {readObject, readString} from '../cms/fields';

export const KNOWN_INTERNAL_PATHS = [
  '/',
  '/menu',
  '/reservas',
  '/legal/privacy_policy',
] as const;

export type ResolvedDestination =
  | {kind: 'internal'; path: (typeof KNOWN_INTERNAL_PATHS)[number]}
  | {kind: 'external'; url: string}
  | {kind: 'unsupported'; reason: string};

export function extractDestinationPath(input: unknown): string | undefined {
  if (typeof input === 'string') {
    return readString(input);
  }

  const value = readObject(input);
  if (!value) {
    return undefined;
  }

  return (
    readString(value.href) ??
    readString(value.path) ??
    readString(value.url) ??
    extractDestinationPath(value.destination)
  );
}

export function resolveDestination(input: unknown): ResolvedDestination | undefined {
  const path = extractDestinationPath(input);
  if (!path) {
    return undefined;
  }

  if (path.startsWith('https://') || path.startsWith('http://')) {
    return resolveExternalUrl(path);
  }

  if (path.startsWith('/')) {
    if (isKnownInternalPath(path)) {
      return {kind: 'internal', path};
    }
    return {kind: 'unsupported', reason: 'unknown-internal-path'};
  }

  return {kind: 'unsupported', reason: 'unrecognized-destination'};
}

export function handleResolvedDestination(
  destination: ResolvedDestination,
): void {
  if (destination.kind === 'external') {
    Linking.openURL(destination.url).catch(() => undefined);
    return;
  }

  if (destination.kind === 'internal' && destination.path === '/reservas') {
    Alert.alert('Reservas', 'Las reservas estarán disponibles pronto.');
    return;
  }

  if (destination.kind === 'unsupported') {
    Alert.alert('No disponible', 'Esta sección no está disponible.');
  }
}

function resolveExternalUrl(path: string): ResolvedDestination {
  try {
    const url = new URL(path);
    if (url.protocol !== 'https:') {
      return {kind: 'unsupported', reason: 'insecure-url'};
    }
    return {kind: 'external', url: url.toString()};
  } catch {
    return {kind: 'unsupported', reason: 'invalid-url'};
  }
}

function isKnownInternalPath(
  path: string,
): path is (typeof KNOWN_INTERNAL_PATHS)[number] {
  return (KNOWN_INTERNAL_PATHS as readonly string[]).includes(path);
}
