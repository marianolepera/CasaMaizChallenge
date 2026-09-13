import type {CmsAlert} from './bootstrap';

export const ALERT_DISMISS_STORAGE_KEY = 'cms-alerts:v1:dismissed';

const HOUR_MS = 60 * 60 * 1000;

export type AlertFrequencyType = 'always' | 'once' | 'session';

export function alertStorageKey(alert: CmsAlert): string {
  return alert.id ?? `${alert.title ?? ''}:${alert.message ?? ''}`;
}

export function appliesToPage(alert: CmsAlert, pageSlug: string): boolean {
  return alert.pageSlugs.length === 0 || alert.pageSlugs.includes(pageSlug);
}

export function normalizeAlertFrequencyType(
  type: string | undefined,
): AlertFrequencyType {
  const key = type?.trim().toLowerCase();
  if (key === 'once' || key === 'session') {
    return key;
  }
  return 'always';
}

export function shouldPersistAlertDismiss(alert: CmsAlert): boolean {
  return normalizeAlertFrequencyType(alert.frequency?.type) !== 'session';
}


export function isAlertOnCooldown(
  alert: CmsAlert,
  dismissedAt: number | undefined,
  now: number,
): boolean {
  if (dismissedAt === undefined) {
    return false;
  }

  const type = normalizeAlertFrequencyType(alert.frequency?.type);

  if (type === 'once' || type === 'session') {
    return true;
  }

  const hours = alert.frequency?.cooldownHours;
  if (hours === undefined || hours <= 0) {
    return false;
  }

  return now - dismissedAt < hours * HOUR_MS;
}

export function selectTopBarAlert(
  alerts: CmsAlert[],
  pageSlug: string,
): CmsAlert | undefined {
  return alerts
    .filter(alert => alert.placement === 'topBar' && appliesToPage(alert, pageSlug))
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))[0];
}

export function parseDismissedAtMap(raw: string | null): Record<string, number> {
  if (!raw) {
    return {};
  }

  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const map: Record<string, number> = {};
    for (const [key, timestamp] of Object.entries(value)) {
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
        map[key] = timestamp;
      }
    }
    return map;
  } catch {
    return {};
  }
}
