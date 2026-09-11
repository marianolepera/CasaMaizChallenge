export const APPEARANCE_STORAGE_KEY = 'appearance:v1:preference';

export const APPEARANCE_PREFERENCES = ['system', 'light', 'dark'] as const;

export type AppearancePreference = (typeof APPEARANCE_PREFERENCES)[number];

export type SystemColorScheme = 'light' | 'dark' | null;

export function parseAppearancePreference(
  value: string | null | undefined,
): AppearancePreference | undefined {
  if (value === 'system' || value === 'light' || value === 'dark') {
    return value;
  }

  return undefined;
}

export function resolveIsDark(
  preference: AppearancePreference,
  systemScheme: SystemColorScheme,
): boolean {
  if (preference === 'light') {
    return false;
  }

  if (preference === 'dark') {
    return true;
  }

  return systemScheme === 'dark';
}

export function toNativeColorScheme(
  preference: AppearancePreference,
): 'light' | 'dark' | 'auto' {
  if (preference === 'system') {
    return 'auto';
  }

  return preference;
}
