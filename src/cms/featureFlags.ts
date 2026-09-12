import {
  isFeatureEnabled,
  shouldRenderFeature,
  type CmsBootstrapPromotion,
  type CmsFeatureFlags,
} from './bootstrap';
import {readArray, readObject, readString} from './fields';
import type {CmsBlock} from './page';

/** Keys the app knows how to render. Values and copy come from the CMS. */
export const FEATURE_NEW_HOME = 'enable_new_home';
export const FEATURE_STORE_LOCATOR_BANNER = 'show_store_locator_banner';

const HOME_PLACEMENTS = new Set(['home', 'homepage']);
const STORE_LOCATOR_PLACEMENTS = new Set([
  'storelocator',
  'store_locator',
  'store-locator',
]);

export function selectHomePromotions(
  flags: CmsFeatureFlags | undefined,
  promotions: CmsBootstrapPromotion[],
  layout: CmsBlock[] = [],
): CmsBootstrapPromotion[] {
  const home = excludePromotionsInLayout(
    promotions.filter(promo => isHomePlacement(promo.placement)),
    layout,
  );
  if (!shouldRenderFeature(flags, FEATURE_NEW_HOME, home.length > 0)) {
    return [];
  }

  return sortByPriority(home);
}

export function applyHomeFeatureFlags(
  layout: CmsBlock[],
  flags: CmsFeatureFlags | undefined,
): CmsBlock[] {
  if (isFeatureEnabled(flags, FEATURE_NEW_HOME)) {
    return layout;
  }

  return layout.filter(block => block.blockType !== 'promoRail');
}

export function selectStoreLocatorPromotions(
  flags: CmsFeatureFlags | undefined,
  promotions: CmsBootstrapPromotion[],
): CmsBootstrapPromotion[] {
  const locator = promotions.filter(promo =>
    isStoreLocatorPlacement(promo.placement),
  );
  if (
    !shouldRenderFeature(flags, FEATURE_STORE_LOCATOR_BANNER, locator.length > 0)
  ) {
    return [];
  }

  return sortByPriority(locator);
}

export function isHomePlacement(placement: string | undefined): boolean {
  const key = normalizePlacement(placement);
  return !key || HOME_PLACEMENTS.has(key);
}

export function isStoreLocatorPlacement(placement: string | undefined): boolean {
  const key = normalizePlacement(placement);
  return key !== undefined && STORE_LOCATOR_PLACEMENTS.has(key);
}

function normalizePlacement(placement: string | undefined): string | undefined {
  const key = placement?.trim().toLowerCase();
  return key ? key : undefined;
}

function sortByPriority(
  promotions: CmsBootstrapPromotion[],
): CmsBootstrapPromotion[] {
  return promotions
    .slice()
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));
}

function excludePromotionsInLayout(
  promotions: CmsBootstrapPromotion[],
  layout: CmsBlock[],
): CmsBootstrapPromotion[] {
  const existing = collectLayoutPromoKeys(layout);
  if (existing.size === 0) {
    return promotions;
  }

  return promotions.filter(promo => !promotionMatchesLayout(promo, existing));
}

function collectLayoutPromoKeys(layout: CmsBlock[]): Set<string> {
  const keys = new Set<string>();

  for (const block of layout) {
    if (block.blockType !== 'promoRail') {
      continue;
    }

    for (const item of readArray(block.promotions)) {
      const promo = readObject(item);
      const id = readString(promo?.id);
      const title = readString(promo?.title);
      if (id) {
        keys.add(`id:${id}`);
      }
      if (title) {
        keys.add(`title:${title.toLowerCase()}`);
      }
    }
  }

  return keys;
}

function promotionMatchesLayout(
  promo: CmsBootstrapPromotion,
  existing: Set<string>,
): boolean {
  if (promo.id && existing.has(`id:${promo.id}`)) {
    return true;
  }

  const title = promo.title?.trim().toLowerCase();
  return Boolean(title) && existing.has(`title:${title}`);
}
