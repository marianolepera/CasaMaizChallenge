import type {CmsAppUpdate} from './bootstrap';

export const APP_UPDATE_DISMISS_KEY = 'app-update:v1:dismissed';

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export type AppUpdateDecision =
  | {kind: 'none'}
  | {kind: 'recommended'; message: string; versionKey: string}
  | {kind: 'required'; message: string};

export function parseSemver(
  value: string | undefined,
): [number, number, number] | undefined {
  if (!value) {
    return undefined;
  }

  const match = SEMVER.exec(value);
  if (!match) {
    return undefined;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareSemver(left: string, right: string): number | undefined {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) {
    return undefined;
  }

  for (let index = 0; index < 3; index += 1) {
    if (a[index] < b[index]) {
      return -1;
    }
    if (a[index] > b[index]) {
      return 1;
    }
  }

  return 0;
}

export function evaluateAppUpdate(
  currentVersion: string,
  update: CmsAppUpdate | undefined,
): AppUpdateDecision {
  if (!update?.message) {
    return {kind: 'none'};
  }

  const belowMinimum = isBehind(currentVersion, update.minimumVersion);
  const belowRecommended = isBehind(currentVersion, update.recommendedVersion);

  if (!belowMinimum && !belowRecommended) {
    return {kind: 'none'};
  }

  if (update.policy === 'recommended') {
    return {
      kind: 'recommended',
      message: update.message,
      versionKey: dismissVersionKey(update),
    };
  }

  if (update.policy === 'required' || belowMinimum) {
    return {kind: 'required', message: update.message};
  }

  return {
    kind: 'recommended',
    message: update.message,
    versionKey: dismissVersionKey(update),
  };
}

function isBehind(currentVersion: string, target: string | undefined): boolean {
  const comparison = target
    ? compareSemver(currentVersion, target)
    : undefined;
  return comparison !== undefined && comparison < 0;
}

function dismissVersionKey(update: CmsAppUpdate): string {
  return update.recommendedVersion ?? update.minimumVersion ?? 'unknown';
}
