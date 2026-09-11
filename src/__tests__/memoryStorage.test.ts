import {createMemoryStore} from '../repository/memoryStorage';

describe('memory key-value store', () => {
  it('returns null for a missing key', async () => {
    const store = createMemoryStore();

    await expect(store.getItem('cms:page:home')).resolves.toBeNull();
  });

  it('reads back a value that was written', async () => {
    const store = createMemoryStore();

    await store.setItem('cms:page:home', '{"ok":true}');

    await expect(store.getItem('cms:page:home')).resolves.toBe('{"ok":true}');
  });

  it('overwrites an existing key', async () => {
    const store = createMemoryStore();

    await store.setItem('cms:page:home', 'first');
    await store.setItem('cms:page:home', 'second');

    await expect(store.getItem('cms:page:home')).resolves.toBe('second');
  });

  it('removes a key so later reads miss', async () => {
    const store = createMemoryStore();

    await store.setItem('cms:page:home', '{"ok":true}');
    await store.removeItem('cms:page:home');

    await expect(store.getItem('cms:page:home')).resolves.toBeNull();
  });

  it('keeps keys isolated from each other', async () => {
    const store = createMemoryStore();

    await store.setItem('cms:page:home', 'home');
    await store.setItem('cms:page:menu', 'menu');
    await store.removeItem('cms:page:home');

    await expect(store.getItem('cms:page:home')).resolves.toBeNull();
    await expect(store.getItem('cms:page:menu')).resolves.toBe('menu');
  });
});
