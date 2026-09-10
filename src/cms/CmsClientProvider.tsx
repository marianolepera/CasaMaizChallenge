import {createContext, useContext, useMemo, type ReactNode} from 'react';
import {createCmsClient} from './contentClient';
import type {CmsClient} from './contentClient';

const CmsClientContext = createContext<CmsClient | null>(null);

export type CmsClientProviderProps = {
  children: ReactNode;
  client?: CmsClient;
};

export function CmsClientProvider({
  children,
  client,
}: CmsClientProviderProps) {
  const value = useMemo(() => client ?? createCmsClient(), [client]);

  return (
    <CmsClientContext.Provider value={value}>
      {children}
    </CmsClientContext.Provider>
  );
}

export function useCmsClient(): CmsClient {
  const client = useContext(CmsClientContext);
  if (!client) {
    throw new Error('useCmsClient must be used within CmsClientProvider');
  }
  return client;
}
