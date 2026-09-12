import {evaluateAppUpdate, compareSemver} from '../cms/appUpdate';

const UPDATE_MESSAGE = 'Actualiza para disfrutar el nuevo menú y reservas.';

describe('compareSemver', () => {
  it('orders patch, minor, and major versions', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
    expect(compareSemver('1.5.0', '1.5.0')).toBe(0);
    expect(compareSemver('2.4.0', '1.5.0')).toBe(1);
    expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
  });

  it('ignores invalid CMS semver values', () => {
    expect(compareSemver('1.0.0', 'v1.5.0')).toBeUndefined();
    expect(compareSemver('1', '1.5.0')).toBeUndefined();
  });
});

describe('evaluateAppUpdate', () => {
  it('hides the prompt when the CMS has no message', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        policy: 'recommended',
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
      }),
    ).toEqual({kind: 'none'});
  });

  it('hides the prompt when the app already meets the recommended version', () => {
    expect(
      evaluateAppUpdate('2.4.0', {
        policy: 'recommended',
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({kind: 'none'});
  });

  it('shows a dismissible prompt for the live recommended payload on 1.0.0', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        policy: 'recommended',
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({
      kind: 'recommended',
      message: UPDATE_MESSAGE,
      versionKey: '2.4.0',
    });
  });

  it('keeps recommended policy dismissible even below minimumVersion', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        policy: 'recommended',
        minimumVersion: '1.5.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({
      kind: 'recommended',
      message: UPDATE_MESSAGE,
      versionKey: '1.5.0',
    });
  });

  it('blocks the app when policy is required and the app is behind', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        policy: 'required',
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({kind: 'required', message: UPDATE_MESSAGE});
  });

  it('treats a version below minimum as required when policy is missing', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        minimumVersion: '1.5.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({kind: 'required', message: UPDATE_MESSAGE});
  });

  it('recommends an update when only recommendedVersion is ahead', () => {
    expect(
      evaluateAppUpdate('1.6.0', {
        minimumVersion: '1.5.0',
        recommendedVersion: '2.4.0',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({
      kind: 'recommended',
      message: UPDATE_MESSAGE,
      versionKey: '2.4.0',
    });
  });

  it('ignores invalid version fields instead of blocking', () => {
    expect(
      evaluateAppUpdate('1.0.0', {
        policy: 'required',
        minimumVersion: 'v1.5',
        recommendedVersion: 'latest',
        message: UPDATE_MESSAGE,
      }),
    ).toEqual({kind: 'none'});
  });
});
