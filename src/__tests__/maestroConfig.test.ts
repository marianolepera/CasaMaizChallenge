import {readdirSync, readFileSync} from 'node:fs';

const APP_ID = 'org.reactjs.native.example.CasaMaizChallenge';

describe('Maestro visual flows', () => {
  const files = readdirSync('e2e/maestro').filter(name => name.endsWith('.yaml'));

  it('keeps the iOS app id and the four product flows', () => {
    const config = readFileSync('e2e/maestro/config.yaml', 'utf8');
    expect(config).toContain(`appId: ${APP_ID}`);
    expect(config).toContain('com.casamaizchallenge');
    expect(readFileSync('e2e/maestro/01-home.yaml', 'utf8')).toContain(
      'appId: ${APP_ID}',
    );
    expect(files).toEqual(
      expect.arrayContaining([
        '01-home.yaml',
        '02-menu.yaml',
        '03-privacy.yaml',
        '04-dark.yaml',
      ]),
    );
    expect(files).not.toContain('launch.yaml');
  });

  it('waits on stable testIDs instead of CMS copy', () => {
    const home = readFileSync('e2e/maestro/01-home.yaml', 'utf8');
    const menu = readFileSync('e2e/maestro/02-menu.yaml', 'utf8');
    const privacy = readFileSync('e2e/maestro/03-privacy.yaml', 'utf8');
    const dark = readFileSync('e2e/maestro/04-dark.yaml', 'utf8');

    expect(home).toContain('id: cms-page-layout');
    expect(menu).toContain('id: cms-tab-Menu');
    expect(menu).toContain('id: cms-menu-search');
    expect(privacy).toContain('casamaiz://legal/privacy_policy');
    expect(privacy).toContain('id: privacy-screen');
    expect(dark).toContain('id: cms-appearance-control');
  });

  it('documents how to run and when to update goldens', () => {
    const docs = readFileSync('e2e/maestro/README.md', 'utf8');
    expect(docs).toContain('npm run test:visual:update');
    expect(docs).toContain('npm run test:visual');
    expect(docs).toContain('npm run test:visual:android:update');
    expect(docs).toContain('VISUAL_CROP_TOP');
    expect(docs).toContain('live CMS');
  });

  it('captures a named screenshot at the end of each flow', () => {
    const flows = [
      ['01-home.yaml', '01-home'],
      ['02-menu.yaml', '02-menu'],
      ['03-privacy.yaml', '03-privacy'],
      ['04-dark.yaml', '04-dark'],
    ] as const;

    for (const [file, path] of flows) {
      const yaml = readFileSync(`e2e/maestro/${file}`, 'utf8');
      expect(yaml).toContain('takeScreenshot:');
      expect(yaml).toContain(`path: ${path}`);
    }
  });
});

