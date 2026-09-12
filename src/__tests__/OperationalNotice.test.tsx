import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Platform} from 'react-native';
import {
  OPERATIONAL_NOTICE_TEST_ID,
  OperationalNotice,
} from '../components/molecules/OperationalNotice';
import {lightColors} from '../theme/colors';
import {platformSurfaceStyle} from '../theme/platformSurface';

describe('OperationalNotice', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {value: originalOS});
  });

  it('uses Material elevation on Android and a hairline on iOS', () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    let androidTree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      androidTree = ReactTestRenderer.create(
        <OperationalNotice message="Hoy cerramos cocina a las 22:30." />,
      );
    });

    expect(
      androidTree!.root.findByProps({testID: OPERATIONAL_NOTICE_TEST_ID}).props
        .style,
    ).toEqual(
      expect.arrayContaining([
        platformSurfaceStyle('android', lightColors, 'banner'),
      ]),
    );

    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    let iosTree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      iosTree = ReactTestRenderer.create(
        <OperationalNotice message="Hoy cerramos cocina a las 22:30." />,
      );
    });

    expect(
      iosTree!.root.findByProps({testID: OPERATIONAL_NOTICE_TEST_ID}).props.style,
    ).toEqual(
      expect.arrayContaining([
        platformSurfaceStyle('ios', lightColors, 'banner'),
      ]),
    );
  });
});
