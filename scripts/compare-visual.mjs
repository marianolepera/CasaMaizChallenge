import {copyFile, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

/**
 * Pixel compare for Maestro / simctl screenshots.
 * @see https://github.com/mapbox/pixelmatch
 * @see https://docs.maestro.dev/reference/commands-available/takescreenshot
 */

export const FLOW_NAMES = ['01-home', '02-menu', '03-privacy', '04-dark'];
export const DEFAULT_CROP_TOP = 180;
export const DEFAULT_MAX_RATIO = 0.015;
export const DEFAULT_PIXEL_THRESHOLD = 0.1;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function cropPng(png, cropTop) {
  const top = Math.max(0, Math.min(Math.trunc(cropTop), Math.max(png.height - 1, 0)));
  const height = png.height - top;
  const out = new PNG({width: png.width, height});
  PNG.bitblt(png, out, 0, top, png.width, height, 0, 0);
  return out;
}

export function comparePngs(
  actual,
  expected,
  {
    cropTop = DEFAULT_CROP_TOP,
    maxRatio = DEFAULT_MAX_RATIO,
    threshold = DEFAULT_PIXEL_THRESHOLD,
  } = {},
) {
  const croppedActual = cropPng(actual, cropTop);
  const croppedExpected = cropPng(expected, cropTop);

  if (
    croppedActual.width !== croppedExpected.width ||
    croppedActual.height !== croppedExpected.height
  ) {
    return {
      ok: false,
      reason: 'size-mismatch',
      mismatched: Number.POSITIVE_INFINITY,
      ratio: 1,
      width: croppedActual.width,
      height: croppedActual.height,
      expectedWidth: croppedExpected.width,
      expectedHeight: croppedExpected.height,
      diff: null,
    };
  }

  const diff = new PNG({
    width: croppedActual.width,
    height: croppedActual.height,
  });
  const mismatched = pixelmatch(
    croppedActual.data,
    croppedExpected.data,
    diff.data,
    croppedActual.width,
    croppedActual.height,
    {threshold},
  );
  const total = croppedActual.width * croppedActual.height;
  const ratio = total === 0 ? 1 : mismatched / total;

  return {
    ok: ratio <= maxRatio,
    reason: ratio <= maxRatio ? 'match' : 'pixel-diff',
    mismatched,
    ratio,
    width: croppedActual.width,
    height: croppedActual.height,
    diff,
  };
}

export async function compareVisualDirs({
  actualDir,
  goldenDir,
  diffDir,
  cropTop = Number(process.env.VISUAL_CROP_TOP ?? DEFAULT_CROP_TOP),
  maxRatio = Number(process.env.VISUAL_MAX_DIFF ?? DEFAULT_MAX_RATIO),
  names = FLOW_NAMES,
} = {}) {
  await mkdir(diffDir, {recursive: true});

  const available = new Set(
    (await readdir(actualDir).catch(() => [])).filter(name => name.endsWith('.png')),
  );
  const goldens = new Set(
    (await readdir(goldenDir).catch(() => [])).filter(name => name.endsWith('.png')),
  );

  const failures = [];

  for (const name of names) {
    const file = `${name}.png`;
    const actualPath = join(actualDir, file);
    const goldenPath = join(goldenDir, file);
    const diffPath = join(diffDir, file);

    if (!available.has(file)) {
      failures.push(`${name}: missing actual screenshot (${actualPath})`);
      continue;
    }

    if (!goldens.has(file)) {
      failures.push(
        `${name}: missing golden. Run \`npm run test:visual:update\` on a booted iPhone Simulator.`,
      );
      continue;
    }

    const actual = PNG.sync.read(await readFile(actualPath));
    const expected = PNG.sync.read(await readFile(goldenPath));
    const result = comparePngs(actual, expected, {cropTop, maxRatio});

    if (result.diff) {
      await writeFile(diffPath, PNG.sync.write(result.diff));
    }

    if (!result.ok) {
      const detail =
        result.reason === 'size-mismatch'
          ? `size ${result.width}x${result.height} vs ${result.expectedWidth}x${result.expectedHeight}`
          : `${(result.ratio * 100).toFixed(2)}% pixels differ (max ${(maxRatio * 100).toFixed(2)}%)`;
      failures.push(`${name}: ${detail}`);
    }
  }

  return {ok: failures.length === 0, failures};
}

export async function updateGoldens({
  actualDir,
  goldenDir,
  names = FLOW_NAMES,
} = {}) {
  await mkdir(goldenDir, {recursive: true});
  const copied = [];

  for (const name of names) {
    const file = `${name}.png`;
    const actualPath = join(actualDir, file);
    await copyFile(actualPath, join(goldenDir, file));
    copied.push(file);
  }

  return copied;
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isCli) {
  const actualDir = resolve(process.argv[2] ?? join(repoRoot, 'e2e/maestro/output'));
  const goldenDir = resolve(process.argv[3] ?? join(repoRoot, 'e2e/maestro/goldens'));
  const diffDir = resolve(process.argv[4] ?? join(repoRoot, 'e2e/maestro/diffs'));

  if (process.env.VISUAL_UPDATE === '1') {
    const copied = await updateGoldens({actualDir, goldenDir});
    console.log(`Updated goldens: ${copied.join(', ')}`);
    process.exit(0);
  }

  const {ok, failures} = await compareVisualDirs({
    actualDir,
    goldenDir,
    diffDir,
  });

  if (!ok) {
    console.error('Visual regression failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Visual regression passed.');
}
