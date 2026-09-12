import {Platform, StyleSheet, View} from 'react-native';
import {Text} from '../atoms/Text';
import {platformSurfaceStyle, politeStatusRole, useTheme} from '../../theme';

export const OPERATIONAL_NOTICE_TEST_ID = 'cms-operational-notice';
export const OPERATIONAL_NOTICE_MESSAGE_TEST_ID = 'cms-operational-notice-message';

export type OperationalNoticeProps = {
  message: string;
};

export function OperationalNotice({message}: OperationalNoticeProps) {
  const {colors, radius, spacing} = useTheme();

  return (
    <View
      testID={OPERATIONAL_NOTICE_TEST_ID}
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
        },
      ]}>
      <Text variant="caption" testID={OPERATIONAL_NOTICE_MESSAGE_TEST_ID}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
  },
});
