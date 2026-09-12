import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, isAbsolute, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import openapiTS, {astToString} from 'openapi-typescript';

export const DEFAULT_OPENAPI_URL =
  'https://payload-cms-poc-seven.vercel.app/api/openapi.json';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutFile = resolve(repoRoot, 'src/cms/generated/openapi.ts');

export function resolveSpecSource(spec = process.env.CMS_OPENAPI_URL ?? DEFAULT_OPENAPI_URL) {
  if (/^https?:\/\//.test(spec)) {
    return new URL(spec);
  }

  const filePath = isAbsolute(spec) ? spec : resolve(repoRoot, spec);
  return pathToFileURL(filePath);
}

export async function generateCmsTypes({
  spec = process.env.CMS_OPENAPI_URL ?? DEFAULT_OPENAPI_URL,
  outFile = defaultOutFile,
} = {}) {
  const source = resolveSpecSource(spec);
  const ast = await openapiTS(source);
  const banner = [
    '/**',
    ' * Generated from the published Casa Maiz OpenAPI spec.',
    ' * Do not edit. Regenerate with `npm run cms:types`.',
    ` * Source: ${source.href}`,
    ' * @see https://openapi-ts.dev/introduction',
    ' */',
    '',
  ].join('\n');

  await mkdir(dirname(outFile), {recursive: true});
  await writeFile(outFile, `${banner}${astToString(ast)}`);
  return outFile;
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isCli) {
  const outFile = await generateCmsTypes({
    spec: process.argv[2],
    outFile: process.argv[3],
  });
  console.log(`Wrote ${outFile}`);
}
