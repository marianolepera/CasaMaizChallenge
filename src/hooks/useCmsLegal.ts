import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isAbortError, isCmsError, networkError} from '../api/errors';
import type {CmsError} from '../api/errors';
import type {LegalKey} from '../cms/contentClient';
import {useCmsClient} from '../cms/CmsClientProvider';
import {parseCmsLegal} from '../cms/legal';
import type {CmsLegalDocument} from '../cms/legal';
import {getRuntimeContentQuery} from '../config';
import {useContentRepository} from '../repository/ContentRepositoryProvider';
import type {CacheReadResult} from '../repository/contentRepository';
import type {CmsPageSource} from './useCmsPage';

export type CmsLegalQuery = {
  document: CmsLegalDocument | null;
  error: CmsError | null;
  loading: boolean;
  refreshing: boolean;
  source: CmsPageSource | null;
  reload: () => void;
  refresh: () => void;
};

export function useCmsLegal(key: LegalKey): CmsLegalQuery {
  const client = useCmsClient();
  const repository = useContentRepository();
  const context = useMemo(() => getRuntimeContentQuery(), []);
  const [document, setDocument] = useState<CmsLegalDocument | null>(null);
  const [error, setError] = useState<CmsError | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<CmsPageSource | null>(null);
  const [requestId, setRequestId] = useState(0);
  const silentRefresh = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const isRefresh = silentRefresh.current;
    silentRefresh.current = false;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    const load = async () => {
      try {
        const envelope = await client.getLegal(key, controller.signal);
        if (controller.signal.aborted) {
          return;
        }

        setDocument(parseCmsLegal(envelope.data));
        setError(null);
        setSource('network');

        try {
          await repository.writeLegal(key, context, envelope);
        } catch {
          // Persist is best-effort; never log the CMS payload.
        }
      } catch (reason) {
        if (isAbortError(reason) || controller.signal.aborted) {
          return;
        }

        const cmsError = isCmsError(reason) ? reason : networkError(reason);
        let cached: CacheReadResult = {status: 'miss'};

        try {
          cached = await repository.readLegal(key, context);
        } catch {
          cached = {status: 'miss'};
        }

        if (controller.signal.aborted) {
          return;
        }

        if (cached.status === 'hit') {
          setDocument(parseCmsLegal(cached.envelope.data));
          setSource('cache');
          setError(cmsError);
          return;
        }

        setError(cmsError);
        setDocument(null);
        setSource(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();

    return () => {
      controller.abort();
    };
  }, [client, context, key, repository, requestId]);

  const reload = useCallback(() => {
    silentRefresh.current = false;
    setRequestId(value => value + 1);
  }, []);

  const refresh = useCallback(() => {
    silentRefresh.current = true;
    setRequestId(value => value + 1);
  }, []);

  return {document, error, loading, refreshing, source, reload, refresh};
}
