import {probeReachability} from '../api/reachability';
import {DEFAULT_API_BASE_URL} from '../config';

describe('probeReachability', () => {
  it('treats any HTTP response as online', async () => {
    const fetchFn = jest.fn().mockResolvedValue(new Response(null, {status: 503}));

    await expect(probeReachability(fetchFn)).resolves.toBe(true);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining(DEFAULT_API_BASE_URL),
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('treats a transport failure as offline', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    await expect(probeReachability(fetchFn)).resolves.toBe(false);
  });
});
