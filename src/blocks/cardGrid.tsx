import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {useTheme} from '../theme';
import {readArray, readObject, readString} from './fields';
import type {BlockProps} from './types';

export function CardGrid({block}: BlockProps) {
  const {spacing, colors, radius} = useTheme();
  const {width} = useWindowDimensions();
  const eyebrow = readString(block.eyebrow);
  const title = readString(block.title);
  const cards = readArray(block.cards);
  const gutter = spacing.md;
  const gap = spacing.sm;
  const cardWidth = Math.max((width - gutter * 2 - gap) / 2, 140);

  return (
    <View testID="cms-card-grid" style={{gap: spacing.md, paddingHorizontal: gutter}}>
      {eyebrow ? (
        <Text variant="eyebrow" muted>
          {eyebrow}
        </Text>
      ) : null}
      {title ? (
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={[styles.grid, {gap}]}>
        {cards.map((card, index) => {
          const item = readObject(card);
          if (!item) {
            return null;
          }

          const cardTitle = readString(item.title);
          const description = readString(item.description);
          const price = readString(item.price);

          return (
            <View
              key={cardTitle ?? `card-${index}`}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderColor: colors.border,
                },
              ]}>
              <CmsImage
                media={item.image}
                style={{borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md}}
              />
              <View style={{padding: spacing.sm, gap: spacing.xxs}}>
                {cardTitle ? <Text variant="button">{cardTitle}</Text> : null}
                {description ? (
                  <Text muted variant="caption">
                    {description}
                  </Text>
                ) : null}
                {price ? <Text variant="button">{price}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
