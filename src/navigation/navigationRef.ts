import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './routes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToInternalPath(
  path: '/' | '/menu' | '/reservas' | '/legal/privacy_policy',
): void {
  if (!navigationRef.isReady()) {
    return;
  }

  if (path === '/') {
    navigationRef.navigate('Tabs', {screen: 'Home'});
    return;
  }

  if (path === '/menu') {
    navigationRef.navigate('Tabs', {screen: 'Menu'});
    return;
  }

  if (path === '/reservas') {
    navigationRef.navigate('Reservations');
    return;
  }

  navigationRef.navigate('Privacy');
}
