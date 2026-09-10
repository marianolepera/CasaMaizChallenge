import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {PageLayout} from '../blocks/PageLayout';
import {UNKNOWN_BLOCK_TEST_ID} from '../blocks/UnknownBlock';
import {
  TEXT_BLOCK_HEADING_TEST_ID,
  TEXT_BLOCK_TEST_ID,
} from '../blocks/textBlock';

function renderLayout(
  layout: Parameters<typeof PageLayout>[0]['layout'],
) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<PageLayout layout={layout} />);
  });
  return tree!;
}

describe('CMS page layout renderer', () => {
  it('renders a textBlock heading from CMS fields', () => {
    const heading = 'Comer aquí es sentarse cerca del fuego.';
    const tree = renderLayout([
      {
        blockType: 'textBlock',
        eyebrow: 'Nuestra casa',
        heading,
        body: 'Casa Maíz celebra las recetas que viajan entre generaciones.',
        alignment: 'center',
      },
    ]);

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_TEST_ID}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props
        .children,
    ).toBe(heading);
  });

  it('handles an unknown block type without crashing', () => {
    const tree = renderLayout([
      {blockType: 'doesNotExist', title: 'no debería romper'},
    ]);

    expect(
      tree.root.findByProps({testID: UNKNOWN_BLOCK_TEST_ID}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({
        accessibilityLabel: 'Este contenido no está disponible',
      }),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({testID: TEXT_BLOCK_TEST_ID}),
    ).toThrow();
  });

  it('keeps rendering known blocks when an unknown block is in the same layout', () => {
    const tree = renderLayout([
      {blockType: 'textBlock', heading: 'Menú de temporada'},
      {blockType: 'futureHero'},
    ]);

    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props
        .children,
    ).toBe('Menú de temporada');
    expect(
      tree.root.findByProps({testID: UNKNOWN_BLOCK_TEST_ID}),
    ).toBeTruthy();
  });
});
