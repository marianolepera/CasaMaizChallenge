import {DEFAULT_API_BASE_URL} from '../config';

const PROBE_TIMEOUT_MS = 3500;

export async function probeReachability(
  fetchFn: typeof fetch = fetch,
  baseUrl: string = DEFAULT_API_BASE_URL,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    await fetchFn(`${baseUrl}/?reachability=${Date.now()}`, {
      method: 'GET',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
