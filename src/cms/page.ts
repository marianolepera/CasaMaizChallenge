import {z} from 'zod';

const cmsBlockSchema = z.looseObject({
  blockType: z.string().min(1),
  id: z.union([z.string(), z.number()]).optional(),
});

const cmsPageSchema = z.looseObject({
  slug: z.string().optional(),
  title: z.string().optional(),
  layout: z.array(z.unknown()).nullable().optional(),
});

export type CmsBlock = {
  blockType: string;
  id?: string | number;
  [key: string]: unknown;
};

/** Runtime page. `OpenApiPublicPage` is the published spec; missing layout must not crash. */
export type CmsPage = {
  slug?: string;
  title?: string;
  layout: CmsBlock[];
};

export function parseCmsPage(data: unknown): CmsPage {
  const parsed = cmsPageSchema.safeParse(data);

  if (!parsed.success) {
    return {layout: []};
  }

  return {
    ...parsed.data,
    layout: parseLayout(parsed.data.layout),
  };
}

export function parseLayout(layout: unknown): CmsBlock[] {
  if (!Array.isArray(layout)) {
    return [];
  }

  const blocks: CmsBlock[] = [];

  for (const item of layout) {
    const block = cmsBlockSchema.safeParse(item);
    if (block.success) {
      blocks.push(block.data as CmsBlock);
    }
  }

  return blocks;
}

export function getBlockKey(block: CmsBlock, index: number): string {
  if (block.id !== undefined && block.id !== null && `${block.id}` !== '') {
    return String(block.id);
  }

  return `${block.blockType}-${index}`;
}
