export type CmsErrorKind =
  | 'network'
  | 'http'
  | 'malformed'
  | 'unsupportedContract';

export type CmsErrorOptions = {
  kind: CmsErrorKind;
  userMessage: string;
  technicalMessage: string;
  status?: number;
  retryable?: boolean;
};

const USER_MESSAGES = {
  network: 'No pudimos conectar. Revisá tu conexión e intentá de nuevo.',
  http: 'Algo salió mal. Intentá de nuevo.',
  httpNotFound: 'No encontramos este contenido.',
  httpForbidden: 'No tenés acceso a este contenido.',
  httpBadRequest: 'No pudimos completar la solicitud.',
  malformed: 'Recibimos una respuesta que no pudimos leer.',
  unsupportedContract:
    'Esta versión de la app no es compatible con el contenido.',
} as const;

export class CmsError extends Error {
  readonly kind: CmsErrorKind;
  readonly userMessage: string;
  readonly technicalMessage: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(options: CmsErrorOptions) {
    super(options.technicalMessage);
    this.name = 'CmsError';
    this.kind = options.kind;
    this.userMessage = options.userMessage;
    this.technicalMessage = options.technicalMessage;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

export function isCmsError(error: unknown): error is CmsError {
  return error instanceof CmsError;
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError')
  );
}

export function networkError(cause?: unknown): CmsError {
  return new CmsError({
    kind: 'network',
    userMessage: USER_MESSAGES.network,
    technicalMessage: technicalFromCause('Network request failed', cause),
    retryable: true,
  });
}

export function malformedError(cause?: unknown): CmsError {
  return new CmsError({
    kind: 'malformed',
    userMessage: USER_MESSAGES.malformed,
    technicalMessage: technicalFromCause('Malformed JSON response', cause),
    retryable: false,
  });
}

export function unsupportedContractError(contractVersion: string): CmsError {
  return new CmsError({
    kind: 'unsupportedContract',
    userMessage: USER_MESSAGES.unsupportedContract,
    technicalMessage: `Unsupported contractVersion "${contractVersion}"`,
    retryable: false,
  });
}

export function httpError(status: number, body: unknown): CmsError {
  return new CmsError({
    kind: 'http',
    userMessage: userMessageForStatus(status),
    technicalMessage: technicalFromHttpBody(status, body),
    status,
    retryable: status >= 500,
  });
}

function userMessageForStatus(status: number): string {
  if (status === 404) {
    return USER_MESSAGES.httpNotFound;
  }
  if (status === 401 || status === 403) {
    return USER_MESSAGES.httpForbidden;
  }
  if (status === 400) {
    return USER_MESSAGES.httpBadRequest;
  }
  return USER_MESSAGES.http;
}

function technicalFromHttpBody(status: number, body: unknown): string {
  const summary = summarizeCmsErrorBody(body);
  return summary ? `HTTP ${status}: ${summary}` : `HTTP ${status}`;
}

function technicalFromCause(prefix: string, cause: unknown): string {
  if (cause instanceof Error && cause.message) {
    return `${prefix}: ${cause.message}`;
  }
  return prefix;
}

export function summarizeCmsErrorBody(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  if ('error' in body && typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }

  if ('errors' in body && Array.isArray(body.errors)) {
    const messages = body.errors
      .map(errorItemMessage)
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  return undefined;
}

function errorItemMessage(item: unknown): string | undefined {
  if (typeof item === 'string' && item.trim()) {
    return item;
  }
  if (
    typeof item === 'object' &&
    item !== null &&
    'message' in item &&
    typeof item.message === 'string' &&
    item.message.trim()
  ) {
    return item.message;
  }
  return undefined;
}
