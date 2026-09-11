import type {ContentEnvelope} from '../cms/envelope';

type CacheExpiryFields = Pick<ContentEnvelope, 'nextChangeAt' | 'preview'>;

export function isCacheValid(
  envelope: Pick<ContentEnvelope, 'nextChangeAt'>,
  now: Date = new Date(),
): boolean {
  const raw = envelope.nextChangeAt;
  if (raw == null) {
    return true;
  }

  const expiresAt = Date.parse(raw);
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return now.getTime() < expiresAt;
}

export function shouldPersistEnvelope(
  envelope: CacheExpiryFields,
  now: Date = new Date(),
): boolean {
  if (envelope.preview === true) {
    return false;
  }

  return isCacheValid(envelope, now);
}
