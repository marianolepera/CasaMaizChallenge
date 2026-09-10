import {parseContentEnvelope} from '../cms/envelope';
import {SUPPORTED_CONTRACT_VERSION} from '../cms/contract';

const validEnvelope = {
  contractVersion: SUPPORTED_CONTRACT_VERSION,
  data: {navigation: {items: []}},
  nextChangeAt: '2026-09-11T00:00:00.000Z',
  preview: false,
  resolvedContext: {
    appVersion: '1.0.0',
    authenticationState: 'guest',
    market: 'MX',
    now: '2026-09-10T19:27:32.290Z',
    platform: 'ios',
  },
};

describe('content contract envelope', () => {
  it('accepts contract version 1.1 and keeps used fields', () => {
    expect(parseContentEnvelope(validEnvelope)).toEqual(
      expect.objectContaining({
        contractVersion: '1.1',
        data: {navigation: {items: []}},
        nextChangeAt: '2026-09-11T00:00:00.000Z',
        preview: false,
      }),
    );
  });

  it('tolerates non-breaking extra fields from the CMS', () => {
    const parsed = parseContentEnvelope({
      ...validEnvelope,
      editorialNote: 'ignore me',
      data: {navigation: {items: []}, unexpectedModule: true},
    });

    expect(parsed.contractVersion).toBe('1.1');
    expect(parsed).toEqual(
      expect.objectContaining({editorialNote: 'ignore me'}),
    );
    expect(parsed.data).toEqual(
      expect.objectContaining({unexpectedModule: true}),
    );
  });

  it('fails safely when contractVersion is not 1.1', () => {
    expect(() =>
      parseContentEnvelope({...validEnvelope, contractVersion: '2.0'}),
    ).toThrow(
      expect.objectContaining({
        name: 'CmsError',
        kind: 'unsupportedContract',
        retryable: false,
        technicalMessage: 'Unsupported contractVersion "2.0"',
        userMessage:
          'Esta versión de la app no es compatible con el contenido.',
      }),
    );
  });

  it('treats a missing or invalid envelope as malformed', () => {
    expect(() => parseContentEnvelope({contractVersion: '1.1'})).toThrow(
      expect.objectContaining({kind: 'malformed'}),
    );
    expect(() => parseContentEnvelope(null)).toThrow(
      expect.objectContaining({kind: 'malformed'}),
    );
    expect(() =>
      parseContentEnvelope({contractVersion: '1.1', data: []}),
    ).toThrow(expect.objectContaining({kind: 'malformed'}));
  });
});
