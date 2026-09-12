import {parseCmsBootstrap} from '../cms/bootstrap';
import {
  FEATURE_NEW_HOME,
  FEATURE_STORE_LOCATOR_BANNER,
  applyHomeFeatureFlags,
  selectHomePromotions,
  selectStoreLocatorPromotions,
} from '../cms/featureFlags';

const homePromo = {
  title: 'Martes de sobremesa',
  placement: 'home',
  priority: 10,
};

const locatorPromo = {
  title: 'Visitanos en Roma Norte',
  placement: 'storeLocator',
  priority: 1,
};

describe('bootstrap feature flags', () => {
  it('shows home promotions only when enable_new_home is on and copy exists', () => {
    const on = parseCmsBootstrap({
      featureFlags: {[FEATURE_NEW_HOME]: true},
      promotions: [homePromo],
    });
    expect(selectHomePromotions(on.featureFlags, on.promotions).map(item => item.title)).toEqual([
      'Martes de sobremesa',
    ]);

    const off = parseCmsBootstrap({
      featureFlags: {[FEATURE_NEW_HOME]: false},
      promotions: [homePromo],
    });
    expect(selectHomePromotions(off.featureFlags, off.promotions)).toEqual([]);

    const empty = parseCmsBootstrap({
      featureFlags: {[FEATURE_NEW_HOME]: true},
      promotions: [],
    });
    expect(selectHomePromotions(empty.featureFlags, empty.promotions)).toEqual(
      [],
    );
  });

  it('does not invent a store locator banner without locator copy', () => {
    const live = parseCmsBootstrap({
      featureFlags: {
        [FEATURE_NEW_HOME]: true,
        [FEATURE_STORE_LOCATOR_BANNER]: true,
      },
      promotions: [homePromo],
    });

    expect(
      selectStoreLocatorPromotions(live.featureFlags, live.promotions),
    ).toEqual([]);
    expect(selectHomePromotions(live.featureFlags, live.promotions)).toHaveLength(
      1,
    );
  });

  it('shows a store locator promo when the flag is on and placement matches', () => {
    const bootstrap = parseCmsBootstrap({
      featureFlags: {[FEATURE_STORE_LOCATOR_BANNER]: true},
      promotions: [homePromo, locatorPromo],
    });

    expect(
      selectStoreLocatorPromotions(
        bootstrap.featureFlags,
        bootstrap.promotions,
      ).map(item => item.title),
    ).toEqual(['Visitanos en Roma Norte']);
  });

  it('does not repeat a bootstrap promo that the page promoRail already shows', () => {
    const bootstrap = parseCmsBootstrap({
      featureFlags: {[FEATURE_NEW_HOME]: true},
      promotions: [homePromo, {title: 'Solo en bootstrap', placement: 'home'}],
    });
    const layout = [
      {
        blockType: 'promoRail',
        promotions: [{title: 'Martes de sobremesa'}],
      },
    ];

    expect(
      selectHomePromotions(
        bootstrap.featureFlags,
        bootstrap.promotions,
        layout,
      ).map(item => item.title),
    ).toEqual(['Solo en bootstrap']);
  });

  it('hides home promoRail blocks when enable_new_home is off', () => {
    const layout = [
      {blockType: 'textBlock', heading: 'Casa'},
      {blockType: 'promoRail', promotions: [{title: 'Martes de sobremesa'}]},
    ];

    expect(
      applyHomeFeatureFlags(layout, {[FEATURE_NEW_HOME]: true}).map(
        block => block.blockType,
      ),
    ).toEqual(['textBlock', 'promoRail']);
    expect(
      applyHomeFeatureFlags(layout, {[FEATURE_NEW_HOME]: false}).map(
        block => block.blockType,
      ),
    ).toEqual(['textBlock']);
  });

  it('treats a missing placement as a home promotion', () => {
    const bootstrap = parseCmsBootstrap({
      featureFlags: {[FEATURE_NEW_HOME]: true},
      promotions: [{title: 'Sin placement'}],
    });

    expect(
      selectHomePromotions(bootstrap.featureFlags, bootstrap.promotions)[0]
        ?.title,
    ).toBe('Sin placement');
  });
});
