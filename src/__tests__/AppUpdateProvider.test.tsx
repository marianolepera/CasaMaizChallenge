import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppUpdateProvider} from '../cms/AppUpdateProvider';
import {APP_UPDATE_DISMISS_KEY} from '../cms/appUpdate';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {
  APP_UPDATE_DISMISS_TEST_ID,
  APP_UPDATE_MESSAGE_TEST_ID,
} from '../components/molecules/AppUpdateNotice';
import {createMemoryStore} from '../repository/memoryStorage';
import {AppUpdateGate} from '../screens/AppUpdateScreen';

const UPDATE_MESSAGE = 'Actualiza para disfrutar el nuevo menú y reservas.';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function Probe() {
  return (
    <>
      <CmsScreenBanners pageSlug="home" />
      <View testID="app-shell" />
    </>
  );
}

function renderProvider(
  ui: React.ReactElement,
): ReactTestRenderer.ReactTestRenderer {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>{ui}</SafeAreaProvider>,
    );
  });
  return tree!;
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('AppUpdateProvider', () => {
  it('keeps a dismissed recommended update hidden after remount', async () => {
    const store = createMemoryStore();
    const update = {
      policy: 'recommended',
      minimumVersion: '1.5.0',
      recommendedVersion: '2.4.0',
      message: UPDATE_MESSAGE,
    };

    let tree = renderProvider(
      <AppUpdateProvider currentVersion="1.0.0" update={update} store={store}>
        <AppUpdateGate>
          <Probe />
        </AppUpdateGate>
      </AppUpdateProvider>,
    );

    await flush();

    expect(
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}).props.children,
    ).toBe(UPDATE_MESSAGE);
    expect(tree.root.findByProps({testID: 'app-shell'})).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({testID: APP_UPDATE_DISMISS_TEST_ID}).props.onPress();
    });

    expect(() =>
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}),
    ).toThrow();
    expect(await store.getItem(APP_UPDATE_DISMISS_KEY)).toBe('2.4.0');

    await ReactTestRenderer.act(() => {
      tree.unmount();
    });

    tree = renderProvider(
      <AppUpdateProvider currentVersion="1.0.0" update={update} store={store}>
        <AppUpdateGate>
          <Probe />
        </AppUpdateGate>
      </AppUpdateProvider>,
    );

    await flush();

    expect(() =>
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}),
    ).toThrow();
    expect(tree.root.findByProps({testID: 'app-shell'})).toBeTruthy();
  });

  it('blocks the rest of the app for a required update', async () => {
    const tree = renderProvider(
      <AppUpdateProvider
        currentVersion="1.0.0"
        update={{
          policy: 'required',
          minimumVersion: '1.5.0',
          message: UPDATE_MESSAGE,
        }}>
        <AppUpdateGate>
          <Probe />
        </AppUpdateGate>
      </AppUpdateProvider>,
    );

    await flush();

    expect(
      tree.root.findByProps({testID: APP_UPDATE_MESSAGE_TEST_ID}).props.children,
    ).toBe(UPDATE_MESSAGE);
    expect(() => tree.root.findByProps({testID: 'app-shell'})).toThrow();
    expect(() =>
      tree.root.findByProps({testID: APP_UPDATE_DISMISS_TEST_ID}),
    ).toThrow();
  });
});
