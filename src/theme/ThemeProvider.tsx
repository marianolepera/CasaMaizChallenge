import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {Appearance, useColorScheme} from 'react-native';
import {createAsyncStorageStore} from '../repository/asyncStorage';
import type {KeyValueStore} from '../repository/storage';
import {
  APPEARANCE_STORAGE_KEY,
  parseAppearancePreference,
  resolveIsDark,
  toNativeColorScheme,
  type AppearancePreference,
  type SystemColorScheme,
} from './appearance';
import {createTheme, type Theme} from './createTheme';

const ThemeContext = createContext<Theme | null>(null);

const defaultAppearanceStore = createAsyncStorageStore();

export type ThemeProviderProps = {
  children: ReactNode;
  store?: KeyValueStore;
  systemScheme?: SystemColorScheme;
};

export function ThemeProvider({
  children,
  store = defaultAppearanceStore,
  systemScheme,
}: ThemeProviderProps) {
  const deviceScheme = useColorScheme();
  const scheme = systemScheme === undefined ? deviceScheme : systemScheme;
  const [_preference, setPreferenceState] = useState<
    AppearancePreference | undefined
  >(undefined);
  const preference = _preference ?? 'system';
  const isDark = resolveIsDark(preference, scheme);

  const setPreference = useCallback(
    (next: AppearancePreference) => {
      setPreferenceState(next);
      Appearance.setColorScheme(toNativeColorScheme(next));
      store.setItem(APPEARANCE_STORAGE_KEY, next).catch(() => undefined);
    },
    [store],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = parseAppearancePreference(
          await store.getItem(APPEARANCE_STORAGE_KEY),
        );
        if (cancelled || !stored) {
          return;
        }

        setPreferenceState(stored);
        Appearance.setColorScheme(toNativeColorScheme(stored));
      } catch {
        // Preference is optional chrome; stay on system.
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [store]);

  const value = useMemo(
    () => createTheme({isDark, preference, setPreference}),
    [isDark, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  const scheme = useColorScheme();

  const fallback = useMemo(
    () =>
      createTheme({
        isDark: scheme === 'dark',
        preference: 'system',
      }),
    [scheme],
  );

  return context ?? fallback;
}
