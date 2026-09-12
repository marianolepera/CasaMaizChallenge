import {Platform, StyleSheet, View} from 'react-native';
import {platformSurfaceStyle, useTheme} from '../../theme';
import {Button} from '../atoms/Button';
import {Text} from '../atoms/Text';

export const OFFLINE_BANNER_TEST_ID = 'cms-offline-banner';
export const OFFLINE_BANNER_MESSAGE =
  'Sin conexión. Mostrando contenido guardado.';

export type OfflineBannerProps = {
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function OfflineBanner({
  message = OFFLINE_BANNER_MESSAGE,
  actionLabel = 'Reintentar',
  onRetry,
}: OfflineBannerProps) {
  const {colors, radius, spacing} = useTheme();

  return (
    <View
      testID={OFFLINE_BANNER_TEST_ID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={[
        styles.container,
        platformSurfaceStyle(Platform.OS, colors, 'banner'),
        {
          borderRadius: radius.md,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}>
      <Text variant="caption">{message}</Text>
      {onRetry ? (
        <Button variant="secondary" label={actionLabel} onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
  },
});
