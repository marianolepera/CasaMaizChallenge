import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {ConsumeTopSafeArea} from '../components/molecules/ConsumeTopSafeArea';

const insets = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 59, left: 0, right: 0, bottom: 34},
};

function InsetsProbe() {
  const value = useSafeAreaInsets();
  return (
    <Text testID="insets-probe">{`top:${value.top}|bottom:${value.bottom}`}</Text>
  );
}

function renderWith(active: boolean) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={insets}>
        <ConsumeTopSafeArea active={active}>
          <InsetsProbe />
        </ConsumeTopSafeArea>
      </SafeAreaProvider>,
    );
  });
  return tree!;
}

describe('ConsumeTopSafeArea', () => {
  it('zeros top while preserving other insets when active (banner shown)', () => {
    const tree = renderWith(true);

    expect(tree.root.findByProps({testID: 'insets-probe'}).props.children).toBe(
      'top:0|bottom:34',
    );
  });

  it('passes parent insets through when inactive (online)', () => {
    const tree = renderWith(false);

    expect(tree.root.findByProps({testID: 'insets-probe'}).props.children).toBe(
      'top:59|bottom:34',
    );
  });
});
