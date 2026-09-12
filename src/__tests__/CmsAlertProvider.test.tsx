import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ALERT_DISMISS_STORAGE_KEY} from '../cms/alerts';
import {parseCmsBootstrap} from '../cms/bootstrap';
import {CmsAlertProvider} from '../cms/CmsAlertProvider';
import {CmsBootstrapProvider} from '../cms/CmsBootstrapProvider';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {
  CMS_ALERT_DISMISS_TEST_ID,
  CMS_ALERT_MESSAGE_TEST_ID,
  CMS_ALERT_TEST_ID,
  CMS_ALERT_TITLE_TEST_ID,
} from '../components/molecules/CmsAlertBanner';
import {createMemoryStore} from '../repository/memoryStorage';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

const liveAlert = {
  id: '6a5a9603de94bce2344e60ed',
  title: 'Aviso de cierre',
  message: 'Hoy tenemos un compromiso de aviso de cierre',
  placement: 'topBar',
  dismissible: true,
  priority: 100,
  pageSlugs: [] as string[],
  frequency: {type: 'always', cooldownHours: 24},
  trigger: {type: 'load', delayMs: 0},
  actions: [
    {label: 'Ir a google', href: '/legal/privacy_policy'},
    {label: 'Ir a menú', href: '/menu'},
  ],
};

function renderAlert({
  alert = liveAlert,
  pageSlug = 'home',
  store = createMemoryStore(),
}: {
  alert?: typeof liveAlert;
  pageSlug?: string;
  store?: ReturnType<typeof createMemoryStore>;
} = {}) {
  const bootstrap = parseCmsBootstrap({alerts: [alert]});
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <CmsBootstrapProvider bootstrap={bootstrap}>
          <CmsAlertProvider store={store}>
            <CmsScreenBanners pageSlug={pageSlug} />
            <View testID="app-shell" />
          </CmsAlertProvider>
        </CmsBootstrapProvider>
      </SafeAreaProvider>,
    );
  });
  return {tree: tree!, store};
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('CmsAlertProvider', () => {
  it('shows a dismissible topBar alert and keeps it hidden after remount during cooldown', async () => {
    const store = createMemoryStore();
    let {tree} = renderAlert({store});

    await flush();

    expect(
      tree.root.findByProps({testID: CMS_ALERT_TITLE_TEST_ID}).props.children,
    ).toBe('Aviso de cierre');
    expect(
      tree.root.findByProps({testID: CMS_ALERT_MESSAGE_TEST_ID}).props.children,
    ).toBe('Hoy tenemos un compromiso de aviso de cierre');

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({testID: CMS_ALERT_DISMISS_TEST_ID}).props.onPress();
    });

    expect(() => tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();
    expect(await store.getItem(ALERT_DISMISS_STORAGE_KEY)).toContain(
      '6a5a9603de94bce2344e60ed',
    );

    await ReactTestRenderer.act(() => {
      tree.unmount();
    });

    ({tree} = renderAlert({store}));
    await flush();

    expect(() => tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();
    expect(tree.root.findByProps({testID: 'app-shell'})).toBeTruthy();
  });

  it('waits for the CMS load delay before showing the alert', async () => {
    jest.useFakeTimers();
    try {
      const {tree} = renderAlert({
        alert: {
          ...liveAlert,
          trigger: {type: 'load', delayMs: 3000},
        },
      });

      await flush();
      expect(() => tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();

      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(2999);
      });
      expect(() => tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();

      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(1);
      });
      expect(
        tree.root.findByProps({testID: CMS_ALERT_TITLE_TEST_ID}).props.children,
      ).toBe('Aviso de cierre');
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not show a menu-targeted alert on Home', async () => {
    const {tree} = renderAlert({
      pageSlug: 'home',
      alert: {...liveAlert, pageSlugs: ['menu']},
    });

    await flush();

    expect(() => tree.root.findByProps({testID: CMS_ALERT_TEST_ID})).toThrow();
  });
});
