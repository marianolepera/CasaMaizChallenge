import {createContext, useContext, useMemo, type ReactNode} from 'react';
import {createAsyncStorageStore} from './asyncStorage';
import {createContentRepository} from './contentRepository';
import type {ContentRepository} from './contentRepository';

const ContentRepositoryContext = createContext<ContentRepository | null>(null);

export type ContentRepositoryProviderProps = {
  children: ReactNode;
  repository?: ContentRepository;
};

export function ContentRepositoryProvider({
  children,
  repository,
}: ContentRepositoryProviderProps) {
  const value = useMemo(
    () => repository ?? createContentRepository(createAsyncStorageStore()),
    [repository],
  );

  return (
    <ContentRepositoryContext.Provider value={value}>
      {children}
    </ContentRepositoryContext.Provider>
  );
}

export function useContentRepository(): ContentRepository {
  const repository = useContext(ContentRepositoryContext);
  if (!repository) {
    throw new Error(
      'useContentRepository must be used within ContentRepositoryProvider',
    );
  }
  return repository;
}
