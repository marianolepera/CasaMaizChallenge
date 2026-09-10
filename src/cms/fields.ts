export function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

export function readObject(
  value: unknown,
): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

export function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export type TextAlignment = 'left' | 'center' | 'right';

export function readAlignment(value: unknown): TextAlignment {
  if (value === 'center' || value === 'right' || value === 'left') {
    return value;
  }

  return 'left';
}
