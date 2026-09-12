import {Platform, StyleSheet, View} from 'react-native';
import {platformSurfaceStyle, politeStatusRole, useTheme} from '../../theme';
import {Button} from '../atoms/Button';
import {Text} from '../atoms/Text';

export const APP_UPDATE_TEST_ID = 'cms-app-update';
export const APP_UPDATE_MESSAGE_TEST_ID = 'cms-app-update-message';
export const APP_UPDATE_DISMISS_TEST_ID = 'cms-app-update-dismiss';
export const APP_UPDATE_DISMISS_LABEL = 'Cerrar';

export type AppUpdateNoticeProps = {
  message: string;
  onDismiss: () => void;
};

export function AppUpdateNotice({message, onDismiss}: AppUpdateNoticeProps) {
  const {colors, radius, spacing} = useTheme();

  return (
    <View
      testID={APP_UPDATE_TEST_ID}
      accessibilityRole={politeStatusRole()}
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
      <Text variant="caption" testID={APP_UPDATE_MESSAGE_TEST_ID}>
        {message}
      </Text>
      <Button
        variant="secondary"
        label={APP_UPDATE_DISMISS_LABEL}
        testID={APP_UPDATE_DISMISS_TEST_ID}
        onPress={onDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
  },
});
