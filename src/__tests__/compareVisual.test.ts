import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {PNG} from 'pngjs';

const execFileAsync = promisify(execFile);

function solidPng(width: number, height: number, r: number, g: number, b: number) {
  const png = new PNG({width, height});
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

function pngWithTopRow(
  width: number,
  height: number,
  body: [number, number, number],
  top: [number, number, number],
) {
  const png = new PNG({width, height});
  for (let y = 0; y < height; y += 1) {
    const [r, g, b] = y === 0 ? top : body;
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

async function writeFlowPngs(dir: string, bytes: Buffer) {
  await mkdir(dir, {recursive: true});
  for (const name of ['01-home', '02-menu', '03-privacy', '04-dark']) {
    await writeFile(join(dir, `${name}.png`), bytes);
  }
}

describe('compare-visual', () => {
  it('passes when cropped pixels match', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'visual-pass-'));
    const actualDir = join(dir, 'actual');
    const goldenDir = join(dir, 'goldens');
    const diffDir = join(dir, 'diffs');
    const body = solidPng(4, 4, 10, 20, 30);

    await writeFlowPngs(actualDir, body);
    await writeFlowPngs(goldenDir, body);

    const {stdout} = await execFileAsync(
      process.execPath,
      ['scripts/compare-visual.mjs', actualDir, goldenDir, diffDir],
      {cwd: process.cwd(), env: {...process.env, VISUAL_CROP_TOP: '1'}},
    );

    expect(stdout).toContain('Visual regression passed.');
  });

  it('ignores a status-bar row after crop', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'visual-crop-'));
    const actualDir = join(dir, 'actual');
    const goldenDir = join(dir, 'goldens');
    const diffDir = join(dir, 'diffs');

    await writeFlowPngs(actualDir, pngWithTopRow(4, 4, [10, 20, 30], [255, 0, 0]));
    await writeFlowPngs(goldenDir, pngWithTopRow(4, 4, [10, 20, 30], [0, 0, 255]));

    const {stdout} = await execFileAsync(
      process.execPath,
      ['scripts/compare-visual.mjs', actualDir, goldenDir, diffDir],
      {cwd: process.cwd(), env: {...process.env, VISUAL_CROP_TOP: '1'}},
    );

    expect(stdout).toContain('Visual regression passed.');
  });

  it('fails when the content pixels differ', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'visual-fail-'));
    const actualDir = join(dir, 'actual');
    const goldenDir = join(dir, 'goldens');
    const diffDir = join(dir, 'diffs');

    await writeFlowPngs(actualDir, solidPng(4, 4, 10, 20, 30));
    await writeFlowPngs(goldenDir, solidPng(4, 4, 200, 20, 30));

    await expect(
      execFileAsync(
        process.execPath,
        ['scripts/compare-visual.mjs', actualDir, goldenDir, diffDir],
        {cwd: process.cwd(), env: {...process.env, VISUAL_CROP_TOP: '0'}},
      ),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Visual regression failed:'),
    });
  });

  it('fails with an update hint when a golden is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'visual-missing-'));
    const actualDir = join(dir, 'actual');
    const goldenDir = join(dir, 'goldens');
    const diffDir = join(dir, 'diffs');

    await writeFlowPngs(actualDir, solidPng(2, 2, 1, 2, 3));
    await mkdir(goldenDir, {recursive: true});

    await expect(
      execFileAsync(process.execPath, [
        'scripts/compare-visual.mjs',
        actualDir,
        goldenDir,
        diffDir,
      ]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('npm run test:visual:update'),
    });
  });
});
