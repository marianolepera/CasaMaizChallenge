import {createContext, useContext, type ReactNode} from 'react';
import type {CmsBootstrap} from './bootstrap';

const CmsBootstrapContext = createContext<CmsBootstrap | null>(null);

export type CmsBootstrapProviderProps = {
  bootstrap: CmsBootstrap | null;
  children: ReactNode;
};

export function CmsBootstrapProvider({
  bootstrap,
  children,
}: CmsBootstrapProviderProps) {
  return (
    <CmsBootstrapContext.Provider value={bootstrap}>
      {children}
    </CmsBootstrapContext.Provider>
  );
}

export function useBootstrap(): CmsBootstrap | null {
  return useContext(CmsBootstrapContext);
}
