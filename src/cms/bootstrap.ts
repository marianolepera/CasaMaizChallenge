import {z} from 'zod';
import {readArray, readObject, readString} from './fields';
import {
  resolveDestination,
  type ResolvedDestination,
} from '../navigation/destinations';

const bootstrapSchema = z.looseObject({
  navigation: z.unknown().optional(),
  experience: z.unknown().optional(),
});

export type CmsNavItem = {
  label: string;
  destination: ResolvedDestination;
  icon?: string;
  highlighted: boolean;
  id?: string;
};

export type CmsNavigation = {
  key?: string;
  name?: string;
  items: CmsNavItem[];
};

export type CmsBootstrap = {
  navigation: CmsNavigation;
};

export function parseCmsBootstrap(data: unknown): CmsBootstrap {
  const parsed = bootstrapSchema.safeParse(data);

  if (!parsed.success) {
    return {navigation: {items: []}};
  }

  return {
    ...parsed.data,
    navigation: parseCmsNavigation(readNavigationSource(parsed.data)),
  };
}

export function parseCmsNavigation(input: unknown): CmsNavigation {
  const value = readObject(input);
  if (!value) {
    return {items: []};
  }

  const items: CmsNavItem[] = [];
  for (const item of readArray(value.items)) {
    const parsed = parseNavItem(item);
    if (parsed) {
      items.push(parsed);
    }
  }

  return {
    key: readString(value.key),
    name: readString(value.name),
    items,
  };
}

export function hasUsableNavigation(navigation: CmsNavigation): boolean {
  return navigation.items.some(item => item.destination.kind === 'internal');
}

function readNavigationSource(data: {
  navigation?: unknown;
  experience?: unknown;
}): unknown {
  const topLevel = readObject(data.navigation);
  if (topLevel) {
    return topLevel;
  }

  const experience = readObject(data.experience);
  return experience ? experience.navigation : undefined;
}

function parseNavItem(item: unknown): CmsNavItem | undefined {
  const value = readObject(item);
  if (!value) {
    return undefined;
  }

  const label = readString(value.label);
  if (!label) {
    return undefined;
  }

  const destination = resolveDestination(value);
  if (!destination) {
    return undefined;
  }

  return {
    label,
    destination,
    icon: readString(value.icon),
    highlighted: value.highlighted === true,
    id: readString(value.id),
  };
}
