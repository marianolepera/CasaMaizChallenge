import {StyleSheet, View} from 'react-native';
import {Button} from '../components/atoms/Button';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {
  handleResolvedDestination,
  resolveDestination,
} from '../navigation/destinations';
import {useTheme} from '../theme';
import {readArray, readObject, readString} from './fields';
import type {BlockProps} from './types';

export function RestaurantHero({block}: BlockProps) {
  const {spacing} = useTheme();
  const eyebrow = readString(block.eyebrow);
  const headline = readString(block.headline);
  const description = readString(block.description);
  const actions = readArray(block.actions);

  return (
    <View testID="cms-restaurant-hero" style={{gap: spacing.md}}>
      <CmsImage media={block.image} />
      <View style={[styles.copy, {paddingHorizontal: spacing.md, gap: spacing.xs}]}>
        {eyebrow ? (
          <Text variant="eyebrow" muted>
            {eyebrow}
          </Text>
        ) : null}
        {headline ? (
          <Text variant="title" accessibilityRole="header">
            {headline}
          </Text>
        ) : null}
        {description ? <Text>{description}</Text> : null}
        {actions.length > 0 ? (
          <View style={[styles.actions, {gap: spacing.sm, marginTop: spacing.sm}]}>
            {actions.map((action, index) => {
              const item = readObject(action);
              const label = readString(item?.label);
              if (!label) {
                return null;
              }

              const destination = resolveDestination(item ?? action);
              return (
                <Button
                  key={`${label}-${index}`}
                  label={label}
                  variant={index === 0 ? 'primary' : 'secondary'}
                  onPress={() => {
                    if (destination) {
                      handleResolvedDestination(destination);
                    }
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
