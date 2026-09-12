import {Platform, StyleSheet, View} from 'react-native';
import {platformSurfaceStyle, useTheme} from '../../theme';
import {Button} from '../atoms/Button';
import {Text} from '../atoms/Text';

export const CMS_ALERT_TEST_ID = 'cms-alert';
export const CMS_ALERT_TITLE_TEST_ID = 'cms-alert-title';
export const CMS_ALERT_MESSAGE_TEST_ID = 'cms-alert-message';
export const CMS_ALERT_DISMISS_TEST_ID = 'cms-alert-dismiss';
export const CMS_ALERT_DISMISS_LABEL = 'Cerrar';

export type CmsAlertBannerAction = {
  label: string;
};

export type CmsAlertBannerProps = {
  title?: string;
  message?: string;
  actions: CmsAlertBannerAction[];
  onAction: (index: number) => void;
  onDismiss?: () => void;
};

export function CmsAlertBanner({
  title,
  message,
  actions,
  onAction,
  onDismiss,
}: CmsAlertBannerProps) {
  const {colors, radius, spacing} = useTheme();
  const accessibilityLabel = [title, message].filter(Boolean).join('. ');

  return (
    <View
      testID={CMS_ALERT_TEST_ID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={accessibilityLabel}
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
      {title ? (
        <Text variant="heading" accessibilityRole="header" testID={CMS_ALERT_TITLE_TEST_ID}>
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text variant="caption" testID={CMS_ALERT_MESSAGE_TEST_ID}>
          {message}
        </Text>
      ) : null}
      {actions.map((action, index) => (
        <Button
          key={`${action.label}-${index}`}
          label={action.label}
          testID={`cms-alert-action-${index}`}
          onPress={() => onAction(index)}
        />
      ))}
      {onDismiss ? (
        <Button
          variant="secondary"
          label={CMS_ALERT_DISMISS_LABEL}
          testID={CMS_ALERT_DISMISS_TEST_ID}
          onPress={onDismiss}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
  },
});
