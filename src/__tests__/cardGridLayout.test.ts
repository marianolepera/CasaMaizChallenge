import {cardGridItemWidth, chunkRows} from '../blocks/cardGridLayout';

describe('card grid layout', () => {
  it('uses two columns when the grid is wide enough', () => {
    expect(cardGridItemWidth(358, 12)).toEqual({
      columns: 2,
      cardWidth: 173,
    });
  });

  it('uses the full grid width when cards stack in one column', () => {
    expect(cardGridItemWidth(280, 12)).toEqual({
      columns: 1,
      cardWidth: 280,
    });
  });

  it('chunks cards into rows for the chosen column count', () => {
    expect(chunkRows(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
  });
});
