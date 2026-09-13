import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {probeReachability} from '../api/reachability';

const POLL_MS = 2500;

const NetworkStatusContext = createContext<boolean | undefined>(undefined);

export function NetworkStatusProvider({
  children,
  isOnline,
}: {
  children: ReactNode;
  isOnline?: boolean;
}) {
  const detected = useReachabilityProbe(isOnline === undefined);
  return (
    <NetworkStatusContext.Provider value={isOnline ?? detected}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus(): boolean {
  return useContext(NetworkStatusContext) ?? true;
}

function useReachabilityProbe(enabled: boolean): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const check = async () => {
      const reachable = await probeReachability();
      if (!cancelled) {
        setIsOnline(reachable);
      }
    };

    const onAppState = (status: AppStateStatus) => {
      if (status === 'active') {
        check().catch(() => undefined);
      }
    };

    check().catch(() => undefined);
    const interval = setInterval(() => {
      check().catch(() => undefined);
    }, POLL_MS);
    const subscription = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [enabled]);

  return isOnline;
}
