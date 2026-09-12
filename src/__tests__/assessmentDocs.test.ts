import {readFileSync} from 'node:fs';

describe('assessment docs', () => {
  const readme = readFileSync('README.md', 'utf8');

  it('documents a local Android debug APK build instead of a committed binary', () => {
    expect(readme).toContain('./gradlew assembleDebug');
    expect(readme).toContain('app-debug.apk');
    expect(readme).toContain('No APK is committed');
  });

  it('links architecture and accessibility notes', () => {
    expect(readme).toContain('docs/architecture.md');
    expect(readme).toContain('docs/accessibility.md');

    const architecture = readFileSync('docs/architecture.md', 'utf8');
    expect(architecture).toContain('mermaid');
    expect(architecture).toContain('blockType');
    expect(readme).toContain('```mermaid');

    const accessibility = readFileSync('docs/accessibility.md', 'utf8');
    expect(accessibility).toContain('minTouchTarget');
    expect(accessibility).toContain('allowFontScaling');
    expect(accessibility).toContain('https://reactnative.dev/docs/accessibility');
  });
});
