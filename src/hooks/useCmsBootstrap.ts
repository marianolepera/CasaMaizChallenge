import {useCallback, useEffect, useMemo, useState} from 'react';
import {isAbortError, isCmsError, networkError} from '../api/errors';
import type {CmsError} from '../api/errors';
import {parseCmsBootstrap} from '../cms/bootstrap';
import type {CmsBootstrap} from '../cms/bootstrap';
import {useCmsClient} from '../cms/CmsClientProvider';
import {warmSecondaryContent} from '../cms/warmCache';
import {getRuntimeContentQuery} from '../config';
import {useContentRepository} from '../repository/ContentRepositoryProvider';
import type {CacheReadResult} from '../repository/contentRepository';
import type {CmsPageSource} from './useCmsPage';

export type CmsBootstrapQuery = {
  bootstrap: CmsBootstrap | null;
  error: CmsError | null;
  loading: boolean;
  source: CmsPageSource | null;
  reload: () => void;
};

export function useCmsBootstrap(): CmsBootstrapQuery {
  const client = useCmsClient();
  const repository = useContentRepository();
  const context = useMemo(() => getRuntimeContentQuery(), []);
  const [bootstrap, setBootstrap] = useState<CmsBootstrap | null>(null);
  const [error, setError] = useState<CmsError | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CmsPageSource | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const envelope = await client.getBootstrap(controller.signal);
        if (controller.signal.aborted) {
          return;
        }

        setBootstrap(parseCmsBootstrap(envelope.data));
        setError(null);
        setSource('network');

        try {
          await repository.writeBootstrap(context, envelope);
        } catch {
          // Persist is best-effort; never log the CMS payload.
        }

        warmSecondaryContent(client, repository, context, controller.signal).catch(
          () => undefined,
        );
      } catch (reason) {
        if (isAbortError(reason) || controller.signal.aborted) {
          return;
        }

        const cmsError = isCmsError(reason) ? reason : networkError(reason);
        let cached: CacheReadResult = {status: 'miss'};

        try {
          cached = await repository.readBootstrap(context);
        } catch {
          cached = {status: 'miss'};
        }

        if (controller.signal.aborted) {
          return;
        }

        if (cached.status === 'hit') {
          setBootstrap(parseCmsBootstrap(cached.envelope.data));
          setSource('cache');
          setError(cmsError);
          return;
        }

        setError(cmsError);
        setBootstrap(null);
        setSource(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      controller.abort();
    };
  }, [client, context, repository, requestId]);

  const reload = useCallback(() => {
    setRequestId(value => value + 1);
  }, []);

  return {bootstrap, error, loading, source, reload};
}
