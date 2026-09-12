import {Platform} from 'react-native';
import {politeStatusRole} from '../theme/accessibilityRole';

describe('politeStatusRole', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {value: originalOS});
  });

  it('avoids the Android-invalid status role', () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    expect(politeStatusRole()).toBe('none');

    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    expect(politeStatusRole()).toBe('status');
  });
});
