import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {View} from 'react-native';
import {createMemoryStore} from '../repository/memoryStorage';
import {AppearanceControl} from '../theme/AppearanceControl';
import {APPEARANCE_STORAGE_KEY} from '../theme/appearance';
import {darkColors, lightColors} from '../theme/colors';
import {ThemeProvider, useTheme} from '../theme/ThemeProvider';

function Probe() {
  const {colors, isDark} = useTheme();
  return (
    <View
      testID="theme-probe"
      accessibilityLabel={isDark ? 'dark' : 'light'}
      style={{backgroundColor: colors.background}}
    />
  );
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('ThemeProvider', () => {
  it('uses a stored dark preference even when the system scheme is light', async () => {
    const store = createMemoryStore();
    await store.setItem(APPEARANCE_STORAGE_KEY, 'dark');

    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ThemeProvider store={store} systemScheme="light">
          <Probe />
        </ThemeProvider>,
      );
    });

    await flush();

    const probe = tree!.root.findByProps({testID: 'theme-probe'});
    expect(probe.props.accessibilityLabel).toBe('dark');
    expect(probe.props.style.backgroundColor).toBe(darkColors.background);
  });

  it('switches to dark from the Inicio appearance control', async () => {
    const store = createMemoryStore();
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ThemeProvider store={store} systemScheme="light">
          <AppearanceControl />
          <Probe />
        </ThemeProvider>,
      );
    });

    await flush();

    expect(
      tree!.root.findByProps({testID: 'theme-probe'}).props.accessibilityLabel,
    ).toBe('light');
    expect(
      tree!.root.findByProps({testID: 'theme-probe'}).props.style.backgroundColor,
    ).toBe(lightColors.background);

    await ReactTestRenderer.act(async () => {
      tree!.root.findByProps({testID: 'cms-appearance-control'}).props.onPress();
    });

    expect(
      tree!.root.findByProps({testID: 'theme-probe'}).props.accessibilityLabel,
    ).toBe('dark');
    expect(await store.getItem(APPEARANCE_STORAGE_KEY)).toBe('dark');
  });
});
