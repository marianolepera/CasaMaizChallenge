import {readFileSync} from 'node:fs';

describe('performance notes', () => {
  const notes = readFileSync('docs/performance.md', 'utf8');

  it('exists and points at the official RN profiler', () => {
    expect(notes).toContain('https://reactnative.dev/docs/profiling');
    expect(notes).toContain('no Systrace');
  });

  it('records the list, prefetch, cache, and motion choices', () => {
    expect(notes).toContain('ScrollView');
    expect(notes).toContain('FlatList');
    expect(notes).toContain('prefetchPageImages');
    expect(notes).toContain('nextChangeAt');
    expect(notes).toContain('Reduce Motion');
  });

  it('is linked from the root README', () => {
    const readme = readFileSync('README.md', 'utf8');
    expect(readme).toContain('docs/performance.md');
  });
});
