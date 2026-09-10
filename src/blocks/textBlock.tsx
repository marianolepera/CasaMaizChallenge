import {StyleSheet, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {useTheme} from '../theme';
import {readAlignment, readString} from './fields';
import type {BlockProps} from './types';

export const TEXT_BLOCK_TEST_ID = 'cms-text-block';
export const TEXT_BLOCK_HEADING_TEST_ID = 'cms-text-block-heading';

export function TextBlock({block}: BlockProps) {
  const {spacing} = useTheme();
  const eyebrow = readString(block.eyebrow);
  const heading = readString(block.heading);
  const body = readString(block.body);
  const alignment = readAlignment(block.alignment);

  if (!eyebrow && !heading && !body) {
    return null;
  }

  return (
    <View
      testID={TEXT_BLOCK_TEST_ID}
      style={[styles.container, {gap: spacing.xs, paddingHorizontal: spacing.md}]}>
      {eyebrow ? (
        <Text variant="eyebrow" muted style={{textAlign: alignment}}>
          {eyebrow}
        </Text>
      ) : null}
      {heading ? (
        <Text
          variant="heading"
          accessibilityRole="header"
          testID={TEXT_BLOCK_HEADING_TEST_ID}
          style={{textAlign: alignment}}>
          {heading}
        </Text>
      ) : null}
      {body ? (
        <Text style={{textAlign: alignment}}>{body}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
