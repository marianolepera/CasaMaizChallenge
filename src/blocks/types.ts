import type {ComponentType} from 'react';
import type {CmsBlock} from '../cms/page';

export type BlockProps = {
  block: CmsBlock;
};

export type BlockComponent = ComponentType<BlockProps>;
