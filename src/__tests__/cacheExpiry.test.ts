import {isCacheValid, shouldPersistEnvelope} from '../repository/cacheExpiry';

const now = new Date('2026-09-11T12:00:00.000Z');

describe('cache expiry', () => {
  it('treats a missing nextChangeAt as still valid', () => {
    expect(isCacheValid({}, now)).toBe(true);
    expect(isCacheValid({nextChangeAt: null}, now)).toBe(true);
  });

  it('is valid when now is before nextChangeAt', () => {
    expect(
      isCacheValid({nextChangeAt: '2026-09-11T12:00:01.000Z'}, now),
    ).toBe(true);
  });

  it('expires when now is at or after nextChangeAt', () => {
    expect(
      isCacheValid({nextChangeAt: '2026-09-11T12:00:00.000Z'}, now),
    ).toBe(false);
    expect(
      isCacheValid({nextChangeAt: '2026-09-11T11:59:59.000Z'}, now),
    ).toBe(false);
  });

  it('does not treat an unparseable nextChangeAt as current content', () => {
    expect(isCacheValid({nextChangeAt: 'not-a-date'}, now)).toBe(false);
    expect(isCacheValid({nextChangeAt: ''}, now)).toBe(false);
  });

  it('does not persist preview envelopes', () => {
    expect(
      shouldPersistEnvelope(
        {preview: true, nextChangeAt: '2026-09-12T00:00:00.000Z'},
        now,
      ),
    ).toBe(false);
  });

  it('does not persist envelopes that are already expired', () => {
    expect(
      shouldPersistEnvelope(
        {preview: false, nextChangeAt: '2026-09-11T11:00:00.000Z'},
        now,
      ),
    ).toBe(false);
  });

  it('persists a live envelope with a future nextChangeAt', () => {
    expect(
      shouldPersistEnvelope(
        {preview: false, nextChangeAt: '2026-09-12T00:00:00.000Z'},
        now,
      ),
    ).toBe(true);
  });
});
