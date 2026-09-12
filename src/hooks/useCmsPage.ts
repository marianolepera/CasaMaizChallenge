import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isAbortError, isCmsError, networkError} from '../api/errors';
import type {CmsError} from '../api/errors';
import {useCmsClient} from '../cms/CmsClientProvider';
import type {PageSlug} from '../cms/contentClient';
import {parseCmsPage} from '../cms/page';
import type {CmsPage} from '../cms/page';
import {prefetchPageImages} from '../cms/prefetchImages';
import {DEFAULT_API_BASE_URL, getRuntimeContentQuery} from '../config';
import {useContentRepository} from '../repository/ContentRepositoryProvider';
import type {CacheReadResult} from '../repository/contentRepository';

export type CmsPageSource = 'network' | 'cache';

export type CmsPageQuery = {
  page: CmsPage | null;
  error: CmsError | null;
  loading: boolean;
  refreshing: boolean;
  source: CmsPageSource | null;
  reload: () => void;
  refresh: () => void;
};

export function useCmsPage(slug: PageSlug): CmsPageQuery {
  const client = useCmsClient();
  const repository = useContentRepository();
  const context = useMemo(() => getRuntimeContentQuery(), []);
  const [page, setPage] = useState<CmsPage | null>(null);
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
        const envelope = await client.getPage(slug, controller.signal);
        if (controller.signal.aborted) {
          return;
        }

        const parsed = parseCmsPage(envelope.data);
        setPage(parsed);
        setError(null);
        setSource('network');
        void prefetchPageImages(parsed.layout, DEFAULT_API_BASE_URL);

        try {
          await repository.writePage(slug, context, envelope);
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
          cached = await repository.readPage(slug, context);
        } catch {
          cached = {status: 'miss'};
        }

        if (controller.signal.aborted) {
          return;
        }

        if (cached.status === 'hit') {
          const parsed = parseCmsPage(cached.envelope.data);
          setPage(parsed);
          setSource('cache');
          setError(cmsError);
          void prefetchPageImages(parsed.layout, DEFAULT_API_BASE_URL);
          return;
        }

        setError(cmsError);
        setPage(null);
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
  }, [client, context, repository, requestId, slug]);

  const reload = useCallback(() => {
    silentRefresh.current = false;
    setRequestId(value => value + 1);
  }, []);

  const refresh = useCallback(() => {
    silentRefresh.current = true;
    setRequestId(value => value + 1);
  }, []);

  return {page, error, loading, refreshing, source, reload, refresh};
}
