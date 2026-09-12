import {useState} from 'react';
import {Platform, StyleSheet, useWindowDimensions, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {platformSurfaceStyle, useTheme} from '../theme';
import {cardGridItemWidth, chunkRows} from './cardGridLayout';
import {readArray, readObject, readString} from './fields';
import type {BlockProps} from './types';

export function CardGrid({block}: BlockProps) {
  const {spacing, colors, radius} = useTheme();
  const {width} = useWindowDimensions();
  const eyebrow = readString(block.eyebrow);
  const title = readString(block.title);
  const gutter = spacing.md;
  const gap = spacing.sm;
  const [gridWidth, setGridWidth] = useState(
    Math.max(width - gutter * 2, 0),
  );
  const {columns} = cardGridItemWidth(gridWidth, gap);
  const items = readArray(block.cards).flatMap((card, index) => {
    const item = readObject(card);
    if (!item) {
      return [];
    }

    return [
      {
        key: readString(item.title) ?? `card-${index}`,
        title: readString(item.title),
        description: readString(item.description),
        price: readString(item.price),
        image: item.image,
      },
    ];
  });

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
      <View
        style={[styles.grid, {gap}]}
        onLayout={event => {
          const nextWidth = event.nativeEvent.layout.width;
          setGridWidth(current => (current === nextWidth ? current : nextWidth));
        }}>
        {chunkRows(items, columns).map(row => (
          <View key={row.map(item => item.key).join('-')} style={[styles.row, {gap}]}>
            {row.map(item => (
              <View
                key={item.key}
                style={[
                  styles.card,
                  platformSurfaceStyle(Platform.OS, colors, 'card'),
                  {flex: 1, borderRadius: radius.md},
                ]}>
                <CmsImage
                  media={item.image}
                  style={{
                    borderTopLeftRadius: radius.md,
                    borderTopRightRadius: radius.md,
                  }}
                />
                <View style={{padding: spacing.sm, gap: spacing.xxs}}>
                  {item.title ? (
                    <Text variant="button" testID="cms-card-title">
                      {item.title}
                    </Text>
                  ) : null}
                  {item.description ? (
                    <Text muted variant="caption">
                      {item.description}
                    </Text>
                  ) : null}
                  {item.price ? <Text variant="button">{item.price}</Text> : null}
                </View>
              </View>
            ))}
            {row.length < columns
              ? Array.from({length: columns - row.length}, (_, index) => (
                  <View key={`spacer-${index}`} style={styles.spacer} />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  card: {
    overflow: 'hidden',
  },
  spacer: {
    flex: 1,
  },
});
