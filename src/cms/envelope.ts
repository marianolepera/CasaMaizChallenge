import {z} from 'zod';
import {malformedError, unsupportedContractError} from '../api/errors';
import {
  SUPPORTED_CONTRACT_VERSION,
  isSupportedContractVersion,
} from './contract';
import type {SupportedContractVersion} from './contract';

const resolvedContextSchema = z.looseObject({
  appVersion: z.string().optional(),
  authenticationState: z.string().optional(),
  market: z.string().optional(),
  now: z.string().optional(),
  platform: z.string().optional(),
});

const contentEnvelopeSchema = z.looseObject({
  contractVersion: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  nextChangeAt: z.string().nullable().optional(),
  preview: z.boolean().nullable().optional(),
  resolvedContext: resolvedContextSchema.nullable().optional(),
});

export type ResolvedContext = z.infer<typeof resolvedContextSchema>;

export type ContentEnvelope<TData = Record<string, unknown>> = {
  contractVersion: SupportedContractVersion;
  data: TData;
  nextChangeAt?: string | null;
  preview?: boolean | null;
  resolvedContext?: ResolvedContext | null;
};

export function parseContentEnvelope<TData = Record<string, unknown>>(
  input: unknown,
): ContentEnvelope<TData> {
  const parsed = contentEnvelopeSchema.safeParse(input);

  if (!parsed.success) {
    throw malformedError(parsed.error);
  }

  if (!isSupportedContractVersion(parsed.data.contractVersion)) {
    throw unsupportedContractError(parsed.data.contractVersion);
  }

  return parsed.data as ContentEnvelope<TData>;
}

export {SUPPORTED_CONTRACT_VERSION};
