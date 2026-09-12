import {useCallback} from 'react';
import {FlatList, Platform, StyleSheet, View} from 'react-native';
import {useBootstrap} from '../../cms/CmsBootstrapProvider';
import type {CmsBootstrapPromotion} from '../../cms/bootstrap';
import {
  selectHomePromotions,
  selectStoreLocatorPromotions,
} from '../../cms/featureFlags';
import type {CmsBlock} from '../../cms/page';
import {handleResolvedDestination} from '../../navigation/destinations';
import {platformSurfaceStyle, useTheme} from '../../theme';
import {Button} from '../atoms/Button';
import {Text} from '../atoms/Text';
import {CmsImage} from './CmsImage';

export const HOME_PROMOTIONS_TEST_ID = 'cms-bootstrap-home-promotions';
export const STORE_LOCATOR_TEST_ID = 'cms-bootstrap-store-locator';

export function HomeBootstrapFeatures({layout = []}: {layout?: CmsBlock[]}) {
  const bootstrap = useBootstrap();
  const flags = bootstrap?.featureFlags;
  const promotions = bootstrap?.promotions ?? [];
  const home = selectHomePromotions(flags, promotions, layout);
  const locator = selectStoreLocatorPromotions(flags, promotions);

  return (
    <>
      {home.length > 0 ? (
        <BootstrapPromoRail
          promotions={home}
          testID={HOME_PROMOTIONS_TEST_ID}
        />
      ) : null}
      {locator.length > 0 ? (
        <BootstrapPromoRail
          promotions={locator}
          testID={STORE_LOCATOR_TEST_ID}
        />
      ) : null}
    </>
  );
}

type BootstrapPromoRailProps = {
  promotions: CmsBootstrapPromotion[];
  testID: string;
};

function BootstrapPromoRail({promotions, testID}: BootstrapPromoRailProps) {
  const {colors, radius, spacing} = useTheme();
  const cardSurface = platformSurfaceStyle(Platform.OS, colors, 'card');

  const renderItem = useCallback(
    ({item}: {item: CmsBootstrapPromotion}) => (
      <BootstrapPromoCard
        title={item.title ?? ''}
        eyebrow={item.eyebrow}
        description={item.description}
        ctaLabel={item.ctaLabel}
        mobileImage={item.mobileImage}
        desktopImage={item.desktopImage}
        onPressCta={
          item.destination
            ? () => handleResolvedDestination(item.destination!)
            : undefined
        }
        cardSurface={cardSurface}
        radius={radius.md}
        spacing={spacing.sm}
      />
    ),
    [cardSurface, radius.md, spacing.sm],
  );

  if (promotions.length === 0) {
    return null;
  }

  return (
    <FlatList
      testID={testID}
      horizontal
      data={promotions}
      keyExtractor={(item, index) => item.id ?? item.title ?? `promo-${index}`}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      accessibilityRole="list"
      style={styles.rail}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
      }}
    />
  );
}

type BootstrapPromoCardProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  ctaLabel?: string;
  mobileImage?: unknown;
  desktopImage?: unknown;
  onPressCta?: () => void;
  cardSurface: object;
  radius: number;
  spacing: number;
};

function BootstrapPromoCard({
  title,
  eyebrow,
  description,
  ctaLabel,
  mobileImage,
  desktopImage,
  onPressCta,
  cardSurface,
  radius,
  spacing,
}: BootstrapPromoCardProps) {
  return (
    <View
      style={[styles.card, cardSurface, {borderRadius: radius, width: 280}]}>
      <CmsImage media={mobileImage ?? desktopImage} />
      <View style={{padding: spacing, gap: spacing}}>
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
        {description ? <Text variant="caption">{description}</Text> : null}
        {ctaLabel ? (
          onPressCta ? <Button label={ctaLabel} onPress={onPressCta} /> : null
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexGrow: 0,
  },
  card: {
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
});
