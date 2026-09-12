import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {createAsyncStorageStore} from '../repository/asyncStorage';
import type {KeyValueStore} from '../repository/storage';
import {
  ALERT_DISMISS_STORAGE_KEY,
  alertStorageKey,
  isAlertOnCooldown,
  parseDismissedAtMap,
  selectTopBarAlert,
} from './alerts';
import type {CmsAlert} from './bootstrap';
import {useBootstrap} from './CmsBootstrapProvider';

const defaultAlertStore = createAsyncStorageStore();

type AlertDismissContextValue = {
  dismissedAt: Record<string, number>;
  ready: boolean;
  dismissAlert: (key: string) => void;
};

const AlertDismissContext = createContext<AlertDismissContextValue>({
  dismissedAt: {},
  ready: true,
  dismissAlert: () => undefined,
});

export type CmsAlertProviderProps = {
  children: ReactNode;
  store?: KeyValueStore;
};

export function CmsAlertProvider({
  children,
  store = defaultAlertStore,
}: CmsAlertProviderProps) {
  const [dismissedAt, setDismissedAt] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const dismissedAtRef = useRef(dismissedAt);
  dismissedAtRef.current = dismissedAt;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = parseDismissedAtMap(
          await store.getItem(ALERT_DISMISS_STORAGE_KEY),
        );
        if (!cancelled) {
          setDismissedAt(stored);
        }
      } catch {
        if (!cancelled) {
          setDismissedAt({});
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
  }, [store]);

  const dismissAlert = useCallback(
    (key: string) => {
      const at = Date.now();
      const next = {...dismissedAtRef.current, [key]: at};
      dismissedAtRef.current = next;
      setDismissedAt(next);
      store
        .setItem(ALERT_DISMISS_STORAGE_KEY, JSON.stringify(next))
        .catch(() => undefined);
    },
    [store],
  );

  const value = useMemo(
    () => ({dismissedAt, ready, dismissAlert}),
    [dismissAlert, dismissedAt, ready],
  );

  return (
    <AlertDismissContext.Provider value={value}>
      {children}
    </AlertDismissContext.Provider>
  );
}

export function usePageAlert(pageSlug: string): {
  alert?: CmsAlert;
  onDismiss?: () => void;
} {
  const alerts = useBootstrap()?.alerts ?? [];
  const {dismissedAt, ready, dismissAlert} = useContext(AlertDismissContext);
  const candidate = useMemo(
    () => selectTopBarAlert(alerts, pageSlug),
    [alerts, pageSlug],
  );
  const alertKey = candidate ? alertStorageKey(candidate) : undefined;
  const onCooldown = candidate
    ? isAlertOnCooldown(
        candidate,
        alertKey ? dismissedAt[alertKey] : undefined,
        Date.now(),
      )
    : true;
  const delayMs = candidate?.trigger?.delayMs ?? 0;
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!candidate || !ready || onCooldown) {
      setElapsed(false);
      return;
    }

    if (delayMs <= 0) {
      setElapsed(true);
      return;
    }

    setElapsed(false);
    const timeoutId = setTimeout(() => {
      setElapsed(true);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [candidate, delayMs, onCooldown, ready]);

  const visible = Boolean(candidate && ready && elapsed && !onCooldown);

  return {
    alert: visible ? candidate : undefined,
    onDismiss:
      visible && candidate?.dismissible && alertKey
        ? () => dismissAlert(alertKey)
        : undefined,
  };
}
