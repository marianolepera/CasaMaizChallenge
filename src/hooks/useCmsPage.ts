import {useCallback, useEffect, useRef, useState} from 'react';
import {isAbortError, isCmsError, networkError} from '../api/errors';
import type {CmsError} from '../api/errors';
import {useCmsClient} from '../cms/CmsClientProvider';
import type {PageSlug} from '../cms/contentClient';
import {parseCmsPage} from '../cms/page';
import type {CmsPage} from '../cms/page';

export type CmsPageQuery = {
  page: CmsPage | null;
  error: CmsError | null;
  loading: boolean;
  refreshing: boolean;
  reload: () => void;
  refresh: () => void;
};

export function useCmsPage(slug: PageSlug): CmsPageQuery {
  const client = useCmsClient();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [error, setError] = useState<CmsError | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

    client
      .getPage(slug, controller.signal)
      .then(envelope => {
        setPage(parseCmsPage(envelope.data));
        setError(null);
      })
      .catch(reason => {
        if (isAbortError(reason) || controller.signal.aborted) {
          return;
        }
        setError(isCmsError(reason) ? reason : networkError(reason));
        if (!isRefresh) {
          setPage(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [client, slug, requestId]);

  const reload = useCallback(() => {
    silentRefresh.current = false;
    setRequestId(value => value + 1);
  }, []);

  const refresh = useCallback(() => {
    silentRefresh.current = true;
    setRequestId(value => value + 1);
  }, []);

  return {page, error, loading, refreshing, reload, refresh};
}
