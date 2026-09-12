import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {AccessibilityInfo, Platform, View} from 'react-native';
import {useGlassChrome} from '../hooks/useGlassChrome';

function Probe() {
  const {allowGlass, reduceMotion, reduceTransparency} = useGlassChrome();

  return (
    <View
      testID="glass-probe"
      accessibilityLabel={[
        allowGlass ? 'glass' : 'solid',
        reduceTransparency ? 'opaque' : 'translucent',
        reduceMotion ? 'reduce-motion' : 'motion',
      ].join(' ')}
    />
  );
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function mockAccessibility({
  reduceTransparency = false,
  reduceMotion = false,
}: {
  reduceTransparency?: boolean;
  reduceMotion?: boolean;
}) {
  jest
    .spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled')
    .mockResolvedValue(reduceTransparency);
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(reduceMotion);
}

describe('useGlassChrome', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {value: originalOS});
    jest.restoreAllMocks();
  });

  it('allows glass on iOS when Reduce Transparency is off', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    mockAccessibility({reduceTransparency: false, reduceMotion: false});

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Probe />);
    });
    await flush();

    expect(
      tree!.root.findByProps({testID: 'glass-probe'}).props.accessibilityLabel,
    ).toBe('glass translucent motion');
  });

  it('falls back to solid chrome when Reduce Transparency is on', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    mockAccessibility({reduceTransparency: true});

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Probe />);
    });
    await flush();

    expect(
      tree!.root.findByProps({testID: 'glass-probe'}).props.accessibilityLabel,
    ).toBe('solid opaque motion');
  });

  it('never allows glass on Android', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    mockAccessibility({reduceTransparency: false});

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Probe />);
    });
    await flush();

    expect(
      tree!.root.findByProps({testID: 'glass-probe'}).props.accessibilityLabel,
    ).toBe('solid translucent motion');
  });

  it('exposes Reduce Motion without changing the glass decision', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    mockAccessibility({reduceMotion: true});

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Probe />);
    });
    await flush();

    expect(
      tree!.root.findByProps({testID: 'glass-probe'}).props.accessibilityLabel,
    ).toBe('glass translucent reduce-motion');
  });
});
