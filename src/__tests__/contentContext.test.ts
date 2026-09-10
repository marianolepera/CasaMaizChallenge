import {
  DEFAULT_APP_VERSION,
  DEFAULT_AUDIENCE,
  DEFAULT_MARKET,
  contentQueryFromRuntime,
  createContentContext,
} from '../config/contentContext';

describe('content query context', () => {
  it('builds ios context with required CMS parameters', () => {
    expect(
      contentQueryFromRuntime({
        platform: 'ios',
        appVersion: DEFAULT_APP_VERSION,
      }),
    ).toEqual({
      platform: 'ios',
      market: DEFAULT_MARKET,
      audience: DEFAULT_AUDIENCE,
      appVersion: '1.0.0',
    });
  });

  it('derives android from Platform.OS', () => {
    expect(
      contentQueryFromRuntime({
        platform: 'android',
        appVersion: DEFAULT_APP_VERSION,
      }),
    ).toEqual({
      platform: 'android',
      market: 'MX',
      audience: 'guest',
      appVersion: '1.0.0',
    });
  });

  it('rejects non-semantic app versions', () => {
    expect(() =>
      createContentContext({platform: 'ios', appVersion: '1'}),
    ).toThrow(/Invalid appVersion/);
    expect(() =>
      createContentContext({platform: 'ios', appVersion: 'v1.0'}),
    ).toThrow(/Invalid appVersion/);
  });

  it('rejects platforms that are not ios or android', () => {
    expect(() =>
      createContentContext({platform: 'web', appVersion: '1.0.0'}),
    ).toThrow(/Unsupported content platform/);
  });
});
