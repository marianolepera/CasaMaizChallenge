import {z} from 'zod';
import {readArray, readObject, readString} from './fields';

const legalSchema = z.looseObject({
  title: z.string().optional(),
  summary: z.string().optional(),
  key: z.string().optional(),
  content: z.unknown().optional(),
});

export type CmsLegalDocument = {
  title?: string;
  summary?: string;
  key?: string;
  body: string;
};

export function parseCmsLegal(data: unknown): CmsLegalDocument {
  const parsed = legalSchema.safeParse(data);

  if (!parsed.success) {
    return {body: ''};
  }

  return {
    ...parsed.data,
    title: readString(parsed.data.title),
    summary: readString(parsed.data.summary),
    key: readString(parsed.data.key),
    body: parseLexicalPlainText(parsed.data.content),
  };
}

export function parseLexicalPlainText(content: unknown): string {
  const wrapper = readObject(content);
  if (!wrapper) {
    return typeof content === 'string' ? content.trim() : '';
  }

  const root = readObject(wrapper.root) ?? wrapper;
  const blocks = readArray(root.children)
    .map(block => extractLexicalText(block).trim())
    .filter(Boolean);

  return blocks.join('\n\n');
}

function extractLexicalText(node: unknown): string {
  if (typeof node === 'string') {
    return node;
  }

  const value = readObject(node);
  if (!value) {
    return '';
  }

  if (typeof value.text === 'string') {
    return value.text;
  }

  return readArray(value.children).map(extractLexicalText).join('');
}
