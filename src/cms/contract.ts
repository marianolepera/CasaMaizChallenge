export const SUPPORTED_CONTRACT_VERSION = '1.1' as const;

export type SupportedContractVersion = typeof SUPPORTED_CONTRACT_VERSION;

export function isSupportedContractVersion(
  contractVersion: string,
): contractVersion is SupportedContractVersion {
  return contractVersion === SUPPORTED_CONTRACT_VERSION;
}
