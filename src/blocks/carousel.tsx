import {useCallback} from 'react';
import {FlatList, Platform, StyleSheet, useWindowDimensions, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {platformSurfaceStyle, useTheme} from '../theme';
import {readArray, readObject, readString} from './fields';
import type {BlockProps} from './types';

export function Carousel({block}: BlockProps) {
  const {spacing, colors, radius} = useTheme();
  const {width} = useWindowDimensions();
  const title = readString(block.title);
  const slides = readArray(block.slides)
    .map(readObject)
    .filter((item): item is Record<string, unknown> => Boolean(item));
  const cardWidth = Math.min(width * 0.8, 320);
  const cardSurface = platformSurfaceStyle(Platform.OS, colors, 'card');

  const renderItem = useCallback(
    ({item}: {item: Record<string, unknown>}) => {
      const slideTitle = readString(item.title);
      const description = readString(item.description);

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
          <CmsImage media={item.image} />
          <View style={{padding: spacing.sm, gap: spacing.xxs}}>
            {slideTitle ? (
              <Text variant="heading" accessibilityRole="header">
                {slideTitle}
              </Text>
            ) : null}
            {description ? (
              <Text muted variant="caption">
                {description}
              </Text>
            ) : null}
          </View>
        </View>
      );
    },
    [cardSurface, cardWidth, radius.md, spacing.sm, spacing.xxs],
  );

  return (
    <View testID="cms-carousel" style={{gap: spacing.md}}>
      {title ? (
        <Text
          variant="heading"
          accessibilityRole="header"
          style={{paddingHorizontal: spacing.md}}>
          {title}
        </Text>
      ) : null}
      {slides.length > 0 ? (
        <FlatList
          horizontal
          data={slides}
          keyExtractor={(item, index) => readString(item.title) ?? `slide-${index}`}
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
