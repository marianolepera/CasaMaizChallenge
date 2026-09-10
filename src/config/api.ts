export const DEFAULT_API_BASE_URL =
  'https://payload-cms-poc-seven.vercel.app';

export function normalizeApiBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
