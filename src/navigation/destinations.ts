import {Alert, Linking} from 'react-native';
import {readObject, readString} from '../cms/fields';
import {navigateToInternalPath} from './navigationRef';

export const KNOWN_INTERNAL_PATHS = [
  '/',
  '/menu',
  '/reservas',
  '/legal/privacy_policy',
] as const;

export type KnownInternalPath = (typeof KNOWN_INTERNAL_PATHS)[number];

export type ResolvedDestination =
  | {kind: 'internal'; path: KnownInternalPath}
  | {kind: 'external'; url: string}
  | {kind: 'unsupported'; reason: string};

export type DestinationActions = {
  openExternal: (url: string) => void;
  openInternal: (path: '/' | '/menu' | '/legal/privacy_policy') => void;
  notifyReservationsUnavailable: () => void;
  notifyUnsupported: () => void;
};

export const defaultDestinationActions: DestinationActions = {
  openExternal(url) {
    Linking.openURL(url).catch(() => undefined);
  },
  openInternal(path) {
    navigateToInternalPath(path);
  },
  notifyReservationsUnavailable() {
    Alert.alert('Reservas', 'Las reservas estarán disponibles pronto.');
  },
  notifyUnsupported() {
    Alert.alert('No disponible', 'Esta sección no está disponible.');
  },
};

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
  actions: DestinationActions = defaultDestinationActions,
): void {
  if (destination.kind === 'external') {
    actions.openExternal(destination.url);
    return;
  }

  if (destination.kind === 'internal') {
    if (destination.path === '/reservas') {
      actions.notifyReservationsUnavailable();
      return;
    }

    actions.openInternal(destination.path);
    return;
  }

  actions.notifyUnsupported();
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
