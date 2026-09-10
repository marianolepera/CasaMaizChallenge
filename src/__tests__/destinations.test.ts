import {resolveDestination} from '../navigation/destinations';

describe('destination resolver', () => {
  it('resolves known internal CMS paths', () => {
    expect(resolveDestination({href: '/menu'})).toEqual({
      kind: 'internal',
      path: '/menu',
    });
    expect(resolveDestination({destination: {path: '/reservas'}})).toEqual({
      kind: 'internal',
      path: '/reservas',
    });
  });

  it('only opens validated https URLs', () => {
    expect(
      resolveDestination('https://casamaiz.example/menu'),
    ).toEqual({
      kind: 'external',
      url: 'https://casamaiz.example/menu',
    });
    expect(resolveDestination('http://insecure.example')).toEqual({
      kind: 'unsupported',
      reason: 'insecure-url',
    });
    expect(resolveDestination('javascript:alert(1)')).toEqual({
      kind: 'unsupported',
      reason: 'unrecognized-destination',
    });
  });

  it('fails safely for unknown internal destinations', () => {
    expect(resolveDestination('/no-existe')).toEqual({
      kind: 'unsupported',
      reason: 'unknown-internal-path',
    });
    expect(resolveDestination(null)).toBeUndefined();
  });
});
