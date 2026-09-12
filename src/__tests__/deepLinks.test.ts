import {parseDeepLink} from '../navigation/deepLinks';

describe('deep links', () => {
  it('maps casamaiz URLs to known CMS destinations', () => {
    expect(parseDeepLink('casamaiz://')).toEqual({kind: 'internal', path: '/'});
    expect(parseDeepLink('casamaiz://menu')).toEqual({
      kind: 'internal',
      path: '/menu',
    });
    expect(parseDeepLink('casamaiz://legal/privacy_policy')).toEqual({
      kind: 'internal',
      path: '/legal/privacy_policy',
    });
    expect(parseDeepLink('casamaiz://reservas')).toEqual({
      kind: 'internal',
      path: '/reservas',
    });
  });

  it('fails safely for the wrong scheme or an unknown path', () => {
    expect(parseDeepLink('https://casamaiz.example/menu')).toEqual({
      kind: 'unsupported',
      reason: 'unrecognized-destination',
    });
    expect(parseDeepLink('casamaiz://no-existe')).toEqual({
      kind: 'unsupported',
      reason: 'unknown-internal-path',
    });
    expect(parseDeepLink('not a url')).toEqual({
      kind: 'unsupported',
      reason: 'unrecognized-destination',
    });
  });
});
