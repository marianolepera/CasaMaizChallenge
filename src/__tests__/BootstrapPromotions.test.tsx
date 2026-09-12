import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {parseCmsBootstrap} from '../cms/bootstrap';
import {CmsBootstrapProvider} from '../cms/CmsBootstrapProvider';
import {
  HOME_PROMOTIONS_TEST_ID,
  HomeBootstrapFeatures,
  STORE_LOCATOR_TEST_ID,
} from '../components/molecules/BootstrapPromotions';

function renderFeatures(data: unknown) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CmsBootstrapProvider bootstrap={parseCmsBootstrap(data)}>
        <HomeBootstrapFeatures />
      </CmsBootstrapProvider>,
    );
  });
  return tree!;
}

describe('HomeBootstrapFeatures', () => {
  it('renders the CMS home promo title when enable_new_home is on', () => {
    const tree = renderFeatures({
      featureFlags: {enable_new_home: true},
      promotions: [
        {
          title: 'Martes de sobremesa',
          eyebrow: 'Solo por temporada',
          placement: 'home',
          cta: {label: 'Reservar', destination: {path: '/reservas'}},
        },
      ],
    });

    expect(tree.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID})).toBeTruthy();
    expect(
      tree.root.findAllByProps({children: 'Martes de sobremesa'}).length,
    ).toBeGreaterThan(0);
    expect(() => tree.root.findByProps({testID: STORE_LOCATOR_TEST_ID})).toThrow();
  });

  it('hides the same promo when enable_new_home is off', () => {
    const tree = renderFeatures({
      featureFlags: {enable_new_home: false},
      promotions: [{title: 'Martes de sobremesa', placement: 'home'}],
    });

    expect(() =>
      tree.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID}),
    ).toThrow();
    expect(tree.root.findAllByProps({children: 'Martes de sobremesa'})).toEqual(
      [],
    );
  });

  it('renders nothing when the flag is on but promotions are empty', () => {
    const tree = renderFeatures({
      featureFlags: {enable_new_home: true},
      promotions: [],
    });

    expect(() =>
      tree.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID}),
    ).toThrow();
  });

  it('does not render a second card when the page layout already has that promo', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <CmsBootstrapProvider
          bootstrap={parseCmsBootstrap({
            featureFlags: {enable_new_home: true},
            promotions: [{title: 'Martes de sobremesa', placement: 'home'}],
          })}>
          <HomeBootstrapFeatures
            layout={[
              {
                blockType: 'promoRail',
                promotions: [{title: 'Martes de sobremesa'}],
              },
            ]}
          />
        </CmsBootstrapProvider>,
      );
    });

    expect(() =>
      tree!.root.findByProps({testID: HOME_PROMOTIONS_TEST_ID}),
    ).toThrow();
  });

  it('shows a store locator rail only when the CMS sends locator copy', () => {
    const hidden = renderFeatures({
      featureFlags: {show_store_locator_banner: true},
      promotions: [{title: 'Martes de sobremesa', placement: 'home'}],
    });
    expect(() =>
      hidden.root.findByProps({testID: STORE_LOCATOR_TEST_ID}),
    ).toThrow();

    const visible = renderFeatures({
      featureFlags: {show_store_locator_banner: true},
      promotions: [
        {title: 'Visitanos en Roma Norte', placement: 'storeLocator'},
      ],
    });
    expect(visible.root.findByProps({testID: STORE_LOCATOR_TEST_ID})).toBeTruthy();
    expect(
      visible.root.findAllByProps({children: 'Visitanos en Roma Norte'}).length,
    ).toBeGreaterThan(0);
  });
});
