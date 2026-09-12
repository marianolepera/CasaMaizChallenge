import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {DEFAULT_APP_VERSION} from '../config';
import {createAsyncStorageStore} from '../repository/asyncStorage';
import type {KeyValueStore} from '../repository/storage';
import {
  APP_UPDATE_DISMISS_KEY,
  evaluateAppUpdate,
} from './appUpdate';
import type {CmsAppUpdate} from './bootstrap';

const defaultUpdateStore = createAsyncStorageStore();

type AppUpdateContextValue = {
  recommendedMessage?: string;
  requiredMessage?: string;
  onDismissRecommended?: () => void;
};

const AppUpdateContext = createContext<AppUpdateContextValue>({});

export type AppUpdateProviderProps = {
  children: ReactNode;
  update?: CmsAppUpdate;
  currentVersion?: string;
  store?: KeyValueStore;
};

export function AppUpdateProvider({
  children,
  update,
  currentVersion = DEFAULT_APP_VERSION,
  store = defaultUpdateStore,
}: AppUpdateProviderProps) {
  const decision = useMemo(
    () => evaluateAppUpdate(currentVersion, update),
    [currentVersion, update],
  );
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [ready, setReady] = useState(decision.kind !== 'recommended');

  useEffect(() => {
    if (decision.kind !== 'recommended') {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    const load = async () => {
      try {
        const stored = await store.getItem(APP_UPDATE_DISMISS_KEY);
        if (!cancelled) {
          setDismissedKey(stored);
        }
      } catch {
        if (!cancelled) {
          setDismissedKey(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [decision, store]);

  const onDismissRecommended = useCallback(() => {
    if (decision.kind !== 'recommended') {
      return;
    }

    setDismissedKey(decision.versionKey);
    store.setItem(APP_UPDATE_DISMISS_KEY, decision.versionKey).catch(() => undefined);
  }, [decision, store]);

  const visibleRecommended =
    decision.kind === 'recommended' &&
    ready &&
    dismissedKey !== decision.versionKey;

  const value = useMemo<AppUpdateContextValue>(
    () => ({
      recommendedMessage: visibleRecommended ? decision.message : undefined,
      requiredMessage:
        decision.kind === 'required' ? decision.message : undefined,
      onDismissRecommended: visibleRecommended
        ? onDismissRecommended
        : undefined,
    }),
    [decision, onDismissRecommended, visibleRecommended],
  );

  return (
    <AppUpdateContext.Provider value={value}>{children}</AppUpdateContext.Provider>
  );
}

export function useAppUpdate(): AppUpdateContextValue {
  return useContext(AppUpdateContext);
}
