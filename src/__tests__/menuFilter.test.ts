import {filterLayoutByQuery} from '../cms/menuFilter';
import type {CmsBlock} from '../cms/page';

const layout: CmsBlock[] = [
  {
    blockType: 'textBlock',
    heading: 'From the milpa to the table',
  },
  {
    blockType: 'cardGrid',
    title: 'De la milpa',
    cards: [
      {title: 'Esquites', description: 'Elote con mayonesa y chile', price: '$90'},
      {title: 'Tacos de suadero', description: 'Tortilla de maíz azul', price: '$140'},
    ],
  },
];

describe('menu layout filter', () => {
  it('returns the full layout when the query is empty', () => {
    expect(filterLayoutByQuery(layout, '   ')).toEqual(layout);
  });

  it('keeps only matching dishes inside a cardGrid', () => {
    const filtered = filterLayoutByQuery(layout, 'esquites');

    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toEqual(
      expect.objectContaining({
        blockType: 'cardGrid',
        cards: [
          expect.objectContaining({title: 'Esquites'}),
        ],
      }),
    );
  });

  it('matches accent-insensitive dish copy', () => {
    const filtered = filterLayoutByQuery(layout, 'maiz');

    expect(filtered).toEqual([
      expect.objectContaining({
        blockType: 'cardGrid',
        cards: [expect.objectContaining({title: 'Tacos de suadero'})],
      }),
    ]);
  });
});
