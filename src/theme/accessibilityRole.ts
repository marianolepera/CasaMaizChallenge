import {Platform, type AccessibilityRole} from 'react-native';

export function politeStatusRole(): AccessibilityRole {
  return Platform.OS === 'android' ? 'none' : 'status';
}
