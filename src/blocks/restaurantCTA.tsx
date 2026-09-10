import {View} from 'react-native';
import {Button} from '../components/atoms/Button';
import {Text} from '../components/atoms/Text';
import {
  handleResolvedDestination,
  resolveDestination,
} from '../navigation/destinations';
import {useTheme} from '../theme';
import {readString} from './fields';
import type {BlockProps} from './types';

export function RestaurantCTA({block}: BlockProps) {
  const {colors, spacing, radius} = useTheme();
  const headline = readString(block.headline);
  const description = readString(block.description);
  const label = readString(block.label);
  const destination = resolveDestination(block);

  return (
    <View
      testID="cms-restaurant-cta"
      style={{
        marginHorizontal: spacing.md,
        padding: spacing.lg,
        gap: spacing.sm,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.lg,
      }}>
      {headline ? (
        <Text variant="heading" accessibilityRole="header">
          {headline}
        </Text>
      ) : null}
      {description ? <Text muted>{description}</Text> : null}
      {label ? (
        <Button
          label={label}
          onPress={() => {
            if (destination) {
              handleResolvedDestination(destination);
            }
          }}
        />
      ) : null}
    </View>
  );
}
