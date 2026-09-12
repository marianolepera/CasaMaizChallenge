import type {CmsBlock} from './page';
import {readArray, readObject, readString} from './fields';

const TEXT_KEYS = [
  'title',
  'heading',
  'headline',
  'description',
  'body',
  'price',
  'eyebrow',
  'label',
  'caption',
] as const;

export function filterLayoutByQuery(
  layout: CmsBlock[],
  query: string,
): CmsBlock[] {
  const term = normalizeText(query);
  if (!term) {
    return layout;
  }

  const matches: CmsBlock[] = [];

  for (const block of layout) {
    if (block.blockType === 'cardGrid') {
      const filtered = filterCardGrid(block, term);
      if (filtered) {
        matches.push(filtered);
      }
      continue;
    }

    if (blockMatches(block, term)) {
      matches.push(block);
    }
  }

  return matches;
}

function filterCardGrid(block: CmsBlock, term: string): CmsBlock | undefined {
  const cards = readArray(block.cards);
  const matchingCards = cards.filter(card => valueMatches(card, term));

  if (matchingCards.length > 0) {
    return {...block, cards: matchingCards};
  }

  if (blockMatches({...block, cards: undefined}, term)) {
    return block;
  }

  return undefined;
}

function blockMatches(block: CmsBlock, term: string): boolean {
  return valueMatches(block, term);
}

function valueMatches(value: unknown, term: string): boolean {
  const object = readObject(value);
  if (!object) {
    const text = readString(value);
    return text ? normalizeText(text).includes(term) : false;
  }

  for (const key of TEXT_KEYS) {
    const text = readString(object[key]);
    if (text && normalizeText(text).includes(term)) {
      return true;
    }
  }

  return false;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
