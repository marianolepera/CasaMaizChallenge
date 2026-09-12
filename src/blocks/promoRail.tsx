import {useCallback} from 'react';
import {FlatList, Platform, StyleSheet, useWindowDimensions, View} from 'react-native';
import {Button} from '../components/atoms/Button';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {
  handleResolvedDestination,
  resolveDestination,
} from '../navigation/destinations';
import {platformSurfaceStyle, useTheme} from '../theme';
import {readArray, readObject, readString} from './fields';
import type {BlockProps} from './types';

export function PromoRail({block}: BlockProps) {
  const {spacing, colors, radius} = useTheme();
  const {width} = useWindowDimensions();
  const title = readString(block.title);
  const promotions = readArray(block.promotions)
    .map(readObject)
    .filter((item): item is Record<string, unknown> => Boolean(item));
  const cardWidth = Math.min(width * 0.82, 340);
  const cardSurface = platformSurfaceStyle(Platform.OS, colors, 'card');

  const renderItem = useCallback(
    ({item}: {item: Record<string, unknown>}) => {
      const promoTitle = readString(item.title);
      const eyebrow = readString(item.eyebrow);
      const description = readString(item.description);
      const cta = readObject(item.cta);
      const ctaLabel = readString(cta?.label);
      const destination = resolveDestination(cta ?? item);

      return (
        <View
          style={[
            styles.card,
            cardSurface,
            {
              width: cardWidth,
              marginRight: spacing.sm,
              borderRadius: radius.md,
            },
          ]}>
          <CmsImage media={item.mobileImage ?? item.desktopImage} />
          <View style={{padding: spacing.sm, gap: spacing.xs}}>
            {eyebrow ? (
              <Text variant="eyebrow" muted>
                {eyebrow}
              </Text>
            ) : null}
            {promoTitle ? (
              <Text variant="heading" accessibilityRole="header">
                {promoTitle}
              </Text>
            ) : null}
            {description ? <Text variant="caption">{description}</Text> : null}
            {ctaLabel ? (
              <Button
                label={ctaLabel}
                onPress={() => {
                  if (destination) {
                    handleResolvedDestination(destination);
                  }
                }}
              />
            ) : null}
          </View>
        </View>
      );
    },
    [cardSurface, cardWidth, radius.md, spacing.sm, spacing.xs],
  );

  return (
    <View testID="cms-promo-rail" style={{gap: spacing.md}}>
      {title ? (
        <Text
          variant="heading"
          accessibilityRole="header"
          style={{paddingHorizontal: spacing.md}}>
          {title}
        </Text>
      ) : null}
      {promotions.length > 0 ? (
        <FlatList
          horizontal
          data={promotions}
          keyExtractor={(item, index) =>
            readString(item.title) ?? `promo-${index}`
          }
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: spacing.md}}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
