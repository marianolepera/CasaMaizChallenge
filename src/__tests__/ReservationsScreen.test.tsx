import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {parseCmsBootstrap} from '../cms/bootstrap';
import {CmsBootstrapProvider} from '../cms/CmsBootstrapProvider';
import {OFFLINE_BANNER_TEST_ID} from '../components/molecules/OfflineBanner';
import {NetworkStatusProvider} from '../hooks/useNetworkStatus';
import {
  RESERVATIONS_PLACEHOLDER_MESSAGE,
  RESERVATIONS_SCREEN_TEST_ID,
  ReservationsScreen,
} from '../screens/ReservationsScreen';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

describe('ReservationsScreen', () => {
  it('shows a local placeholder using the CMS nav label', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={insets}>
          <CmsBootstrapProvider
            bootstrap={parseCmsBootstrap({
              navigation: {
                items: [
                  {label: 'Reservar', destination: {path: '/reservas'}},
                ],
              },
            })}>
            <ReservationsScreen />
          </CmsBootstrapProvider>
        </SafeAreaProvider>,
      );
    });

    expect(
      tree!.root.findByProps({testID: RESERVATIONS_SCREEN_TEST_ID}),
    ).toBeTruthy();
    expect(tree!.root.findAllByProps({children: 'Reservar'}).length).toBeGreaterThan(
      0,
    );
    expect(
      tree!.root.findAllByProps({children: RESERVATIONS_PLACEHOLDER_MESSAGE})
        .length,
    ).toBeGreaterThan(0);
    expect(() => tree!.root.findByProps({testID: OFFLINE_BANNER_TEST_ID})).toThrow();
  });

  it('leaves the offline banner to the app shell when there is no connection', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={insets}>
          <NetworkStatusProvider isOnline={false}>
            <ReservationsScreen />
          </NetworkStatusProvider>
        </SafeAreaProvider>,
      );
    });

    const frame = tree!.root.findByProps({
      testID: RESERVATIONS_SCREEN_TEST_ID,
    });
    expect(frame.findAllByProps({testID: OFFLINE_BANNER_TEST_ID})).toHaveLength(
      0,
    );
    expect(
      frame.findAllByProps({children: RESERVATIONS_PLACEHOLDER_MESSAGE}).length,
    ).toBeGreaterThan(0);
  });
});
