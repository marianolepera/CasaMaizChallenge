import {parseCmsPage} from '../cms/page';

describe('CMS page layout', () => {
  it('keeps blocks in CMS order and does not assume a hero at index 0', () => {
    const page = parseCmsPage({
      slug: 'home',
      title: 'Casa Maíz',
      layout: [
        {blockType: 'textBlock', heading: 'Primero'},
        {blockType: 'restaurantHero', headline: 'Después'},
      ],
    });

    expect(page.slug).toBe('home');
    expect(page.title).toBe('Casa Maíz');
    expect(page.layout.map(block => block.blockType)).toEqual([
      'textBlock',
      'restaurantHero',
    ]);
    expect(page.layout[0]).toEqual(
      expect.objectContaining({heading: 'Primero'}),
    );
  });

  it('tolerates extra fields on the page and on each block', () => {
    const page = parseCmsPage({
      slug: 'home',
      editorialCampaign: 'spring',
      layout: [
        {
          blockType: 'cardGrid',
          title: 'De la milpa',
          futureField: true,
        },
      ],
    });

    expect(page).toEqual(
      expect.objectContaining({editorialCampaign: 'spring'}),
    );
    expect(page.layout[0]).toEqual(
      expect.objectContaining({
        blockType: 'cardGrid',
        title: 'De la milpa',
        futureField: true,
      }),
    );
  });

  it('returns an empty layout when layout is missing, null, or not an array', () => {
    expect(parseCmsPage({slug: 'home'}).layout).toEqual([]);
    expect(parseCmsPage({slug: 'home', layout: null}).layout).toEqual([]);
    expect(parseCmsPage({slug: 'home', layout: {blockType: 'textBlock'}}).layout).toEqual(
      [],
    );
    expect(parseCmsPage(null).layout).toEqual([]);
  });

  it('skips incomplete items instead of crashing', () => {
    const page = parseCmsPage({
      layout: [
        {heading: 'sin tipo'},
        {blockType: ''},
        {blockType: 'promoRail', title: 'Promo'},
        'not-an-object',
      ],
    });

    expect(page.layout).toEqual([
      expect.objectContaining({blockType: 'promoRail', title: 'Promo'}),
    ]);
  });
});
