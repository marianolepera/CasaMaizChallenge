import {StyleSheet, View} from 'react-native';
import {Text} from '../atoms/Text';
import {useTheme} from '../../theme';

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
      accessibilityRole="status"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
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
    borderWidth: 1,
    borderCurve: 'continuous',
  },
});
