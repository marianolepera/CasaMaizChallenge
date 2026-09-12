import {execFile} from 'node:child_process';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

const CONTRACT_PATHS = [
  '/api/content/v1/bootstrap',
  '/api/content/v1/pages/{slug}',
  '/api/content/v1/legal/{key}',
  '/api/form-submissions',
  '/api/media/file/{filename}',
];

describe('cms:types generator', () => {
  it('generates contract paths from a local OpenAPI fixture without network', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cms-types-'));
    const outFile = join(dir, 'openapi.ts');

    try {
      const {stdout} = await execFileAsync(
        process.execPath,
        [
          'scripts/generate-cms-types.mjs',
          'src/__tests__/fixtures/cms-openapi.json',
          outFile,
        ],
        {cwd: process.cwd()},
      );

      const generated = await readFile(outFile, 'utf8');

      expect(stdout).toContain(outFile);
      expect(generated).toContain('Do not edit. Regenerate with `npm run cms:types`.');
      expect(generated).toContain('cms-openapi.json');
      expect(generated).not.toContain('https://payload-cms-poc-seven.vercel.app');

      for (const path of CONTRACT_PATHS) {
        expect(generated).toContain(`"${path}"`);
      }

      expect(generated).toContain('ContentEnvelope');
      expect(generated).toContain('MobileFormSubmissionRequest');
      expect(generated).toContain('formBlock');
      expect(generated).toContain('"1.1"');
    } finally {
      await rm(dir, {recursive: true, force: true});
    }
  });

  it('keeps the committed generated spec aligned with the live contract paths', async () => {
    const committed = await readFile('src/cms/generated/openapi.ts', 'utf8');

    for (const path of CONTRACT_PATHS) {
      expect(committed).toContain(`"${path}"`);
    }

    expect(committed).toContain('contractVersion: "1.1"');
    expect(committed).toContain('formBlock');
  });
});
