import {useContext, type ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {HeaderHeightContext} from '@react-navigation/elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useBootstrap} from '../cms/CmsBootstrapProvider';
import {EmptyState} from '../components/molecules/EmptyState';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {useGlassChrome} from '../hooks/useGlassChrome';
import {reservationsNavLabel} from '../navigation/routes';
import {useTheme} from '../theme';

export const RESERVATIONS_SCREEN_TEST_ID = 'reservations-screen';

export const RESERVATIONS_PLACEHOLDER_MESSAGE =
  'Las reservas estarán disponibles pronto.';

export function ReservationsScreen() {
  const bootstrap = useBootstrap();
  const title = bootstrap
    ? reservationsNavLabel(bootstrap.navigation)
    : undefined;

  return (
    <ScreenFrame>
      <EmptyState
        title={title ?? 'Reservas'}
        message={RESERVATIONS_PLACEHOLDER_MESSAGE}
      />
    </ScreenFrame>
  );
}

function ScreenFrame({children}: {children: ReactNode}) {
  const {colors} = useTheme();
  const {allowGlass} = useGlassChrome();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const topInset = allowGlass ? headerHeight : 0;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.safe,
        {backgroundColor: colors.background, paddingTop: topInset},
      ]}
      testID={RESERVATIONS_SCREEN_TEST_ID}>
      <CmsScreenBanners pageSlug="reservas" />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
