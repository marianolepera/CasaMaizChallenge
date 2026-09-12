import React from 'react';
import {Image} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {PageLayout} from '../blocks/PageLayout';
import {UNKNOWN_BLOCK_TEST_ID} from '../blocks/UnknownBlock';
import {
  IMAGE_BLOCK_CAPTION_TEST_ID,
  IMAGE_BLOCK_TEST_ID,
} from '../blocks/imageBlock';
import {
  FORM_BLOCK_TEST_ID,
} from '../blocks/formBlock';
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

  it('renders imageBlock caption and prefers the mobile image', () => {
    const tree = renderLayout([
      {
        blockType: 'imageBlock',
        caption: 'Este es un ejemplo',
        fullBleed: false,
        image: {
          url: 'https://cdn.example/desktop.webp',
          alt: 'desktop',
        },
        mobileImage: {
          url: 'https://cdn.example/mobile.webp',
          alt: 'mobile',
        },
      },
    ]);

    expect(tree.root.findByProps({testID: IMAGE_BLOCK_TEST_ID})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: IMAGE_BLOCK_CAPTION_TEST_ID}).props
        .children,
    ).toBe('Este es un ejemplo');
    expect(tree.root.findByType(Image).props.source.uri).toBe(
      'https://cdn.example/mobile.webp',
    );
  });

  it('does not crash when imageBlock has no media or caption', () => {
    const tree = renderLayout([
      {blockType: 'imageBlock'},
      {blockType: 'textBlock', heading: 'Sigue el menú'},
    ]);

    expect(() =>
      tree.root.findByProps({testID: IMAGE_BLOCK_TEST_ID}),
    ).toThrow();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props
        .children,
    ).toBe('Sigue el menú');
  });

  it('registers formBlock and skips an incomplete form without crashing', () => {
    const tree = renderLayout([
      {
        blockType: 'formBlock',
        form: {
          id: 'contact-form-id',
          submitButtonLabel: 'Enviar',
          fields: [
            {blockType: 'text', name: 'name', label: 'Nombre', required: true},
          ],
        },
      },
      {blockType: 'formBlock'},
      {blockType: 'textBlock', heading: 'Después del form'},
    ]);

    expect(tree.root.findByProps({testID: FORM_BLOCK_TEST_ID})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Después del form');
  });
});
