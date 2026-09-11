import {
  handleResolvedDestination,
  resolveDestination,
} from '../navigation/destinations';

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
    expect(resolveDestination('https://casamaiz.example/menu')).toEqual({
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

describe('destination handler', () => {
  const actions = {
    openExternal: jest.fn(),
    openInternal: jest.fn(),
    notifyReservationsUnavailable: jest.fn(),
    notifyUnsupported: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens menu and privacy through the navigator', () => {
    handleResolvedDestination({kind: 'internal', path: '/menu'}, actions);
    handleResolvedDestination(
      {kind: 'internal', path: '/legal/privacy_policy'},
      actions,
    );
    handleResolvedDestination({kind: 'internal', path: '/'}, actions);

    expect(actions.openInternal).toHaveBeenCalledWith('/menu');
    expect(actions.openInternal).toHaveBeenCalledWith('/legal/privacy_policy');
    expect(actions.openInternal).toHaveBeenCalledWith('/');
  });

  it('keeps reservations as a local placeholder', () => {
    handleResolvedDestination({kind: 'internal', path: '/reservas'}, actions);

    expect(actions.notifyReservationsUnavailable).toHaveBeenCalled();
    expect(actions.openInternal).not.toHaveBeenCalled();
  });

  it('opens https destinations and rejects unsupported ones safely', () => {
    handleResolvedDestination(
      {kind: 'external', url: 'https://casamaiz.example/menu'},
      actions,
    );
    handleResolvedDestination(
      {kind: 'unsupported', reason: 'unknown-internal-path'},
      actions,
    );

    expect(actions.openExternal).toHaveBeenCalledWith(
      'https://casamaiz.example/menu',
    );
    expect(actions.notifyUnsupported).toHaveBeenCalled();
  });
});
