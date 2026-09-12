import {z} from 'zod';
import {
  resolveDestination,
  type ResolvedDestination,
} from '../navigation/destinations';
import {readArray, readNumber, readObject, readString} from './fields';

const bootstrapSchema = z.looseObject({
  navigation: z.unknown().optional(),
  experience: z.unknown().optional(),
  featureFlags: z.unknown().optional(),
  alerts: z.unknown().optional(),
  operationalControls: z.unknown().optional(),
  promotions: z.unknown().optional(),
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

export type CmsFeatureFlags = Record<string, boolean>;

export type CmsAlertAction = {
  label: string;
  destination: ResolvedDestination;
};

export type CmsAlertTrigger = {
  type?: string;
  delayMs?: number;
  scrollPercent?: number;
};

export type CmsAlertFrequency = {
  type?: string;
  cooldownHours?: number;
};

export type CmsAlert = {
  id?: string;
  title?: string;
  message?: string;
  placement?: string;
  dismissible: boolean;
  priority?: number;
  pageSlugs: string[];
  trigger?: CmsAlertTrigger;
  frequency?: CmsAlertFrequency;
  actions: CmsAlertAction[];
};

export type CmsAppUpdate = {
  policy?: string;
  minimumVersion?: string;
  recommendedVersion?: string;
  message?: string;
};

export type CmsOperationalControls = {
  mode?: string;
  bannerMessage?: string;
  appUpdate?: CmsAppUpdate;
};

export type CmsBootstrapPromotion = {
  id?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  placement?: string;
  priority?: number;
  ctaLabel?: string;
  destination?: ResolvedDestination;
  mobileImage?: unknown;
  desktopImage?: unknown;
};

export type CmsBootstrap = {
  navigation: CmsNavigation;
  featureFlags: CmsFeatureFlags;
  alerts: CmsAlert[];
  operationalControls?: CmsOperationalControls;
  promotions: CmsBootstrapPromotion[];
};

const EMPTY_BOOTSTRAP: CmsBootstrap = {
  navigation: {items: []},
  featureFlags: {},
  alerts: [],
  promotions: [],
};

export function parseCmsBootstrap(data: unknown): CmsBootstrap {
  const parsed = bootstrapSchema.safeParse(data);

  if (!parsed.success) {
    return EMPTY_BOOTSTRAP;
  }

  return {
    navigation: parseCmsNavigation(readNavigationSource(parsed.data)),
    featureFlags: parseFeatureFlags(parsed.data.featureFlags),
    alerts: parseAlerts(parsed.data.alerts),
    operationalControls: parseOperationalControls(parsed.data.operationalControls),
    promotions: parseBootstrapPromotions(parsed.data.promotions),
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

export function isFeatureEnabled(
  flags: CmsFeatureFlags | undefined,
  key: string,
): boolean {
  return flags?.[key] === true;
}

export function shouldRenderFeature(
  flags: CmsFeatureFlags | undefined,
  key: string,
  hasCmsContent: boolean,
): boolean {
  return isFeatureEnabled(flags, key) && hasCmsContent;
}

export function getOperationalNoticeMessage(
  controls: CmsOperationalControls | undefined,
): string | undefined {
  return controls?.bannerMessage;
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

function parseFeatureFlags(input: unknown): CmsFeatureFlags {
  const value = readObject(input);
  if (!value) {
    return {};
  }

  const flags: CmsFeatureFlags = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'boolean') {
      flags[key] = raw;
    }
  }

  return flags;
}

function parseAlerts(input: unknown): CmsAlert[] {
  const alerts: CmsAlert[] = [];

  for (const item of readArray(input)) {
    const parsed = parseAlert(item);
    if (parsed) {
      alerts.push(parsed);
    }
  }

  return alerts;
}

function parseAlert(item: unknown): CmsAlert | undefined {
  const value = readObject(item);
  if (!value) {
    return undefined;
  }

  const title = readString(value.title);
  const message = readString(value.message);
  if (!title && !message) {
    return undefined;
  }

  return {
    id: readString(value.id),
    title,
    message,
    placement: readString(value.placement),
    dismissible: value.dismissible === true,
    priority: readNumber(value.priority),
    pageSlugs: readArray(value.pageSlugs)
      .map(readString)
      .filter((slug): slug is string => Boolean(slug)),
    trigger: parseAlertTrigger(value.trigger),
    frequency: parseAlertFrequency(value.frequency),
    actions: parseAlertActions(value.actions),
  };
}

function parseAlertTrigger(input: unknown): CmsAlertTrigger | undefined {
  const value = readObject(input);
  if (!value) {
    return undefined;
  }

  const trigger: CmsAlertTrigger = {
    type: readString(value.type),
    delayMs: readNumber(value.delayMs),
    scrollPercent: readNumber(value.scrollPercent),
  };

  if (!trigger.type && trigger.delayMs === undefined && trigger.scrollPercent === undefined) {
    return undefined;
  }

  return trigger;
}

function parseAlertFrequency(input: unknown): CmsAlertFrequency | undefined {
  const value = readObject(input);
  if (!value) {
    return undefined;
  }

  const frequency: CmsAlertFrequency = {
    type: readString(value.type),
    cooldownHours: readNumber(value.cooldownHours),
  };

  if (!frequency.type && frequency.cooldownHours === undefined) {
    return undefined;
  }

  return frequency;
}

function parseAlertActions(input: unknown): CmsAlertAction[] {
  const actions: CmsAlertAction[] = [];

  for (const item of readArray(input)) {
    const value = readObject(item);
    const label = readString(value?.label);
    const destination = resolveDestination(value);
    if (!label || !destination) {
      continue;
    }

    actions.push({label, destination});
  }

  return actions;
}

function parseOperationalControls(
  input: unknown,
): CmsOperationalControls | undefined {
  const value = readObject(input);
  if (!value) {
    return undefined;
  }

  const controls: CmsOperationalControls = {
    mode: readString(value.mode),
    bannerMessage: readString(value.bannerMessage),
    appUpdate: parseAppUpdate(value.appUpdate),
  };

  if (!controls.mode && !controls.bannerMessage && !controls.appUpdate) {
    return undefined;
  }

  return controls;
}

function parseAppUpdate(input: unknown): CmsAppUpdate | undefined {
  const value = readObject(input);
  if (!value) {
    return undefined;
  }

  const update: CmsAppUpdate = {
    policy: readString(value.policy),
    minimumVersion: readString(value.minimumVersion),
    recommendedVersion: readString(value.recommendedVersion),
    message: readString(value.message),
  };

  if (
    !update.policy &&
    !update.minimumVersion &&
    !update.recommendedVersion &&
    !update.message
  ) {
    return undefined;
  }

  return update;
}

function parseBootstrapPromotions(input: unknown): CmsBootstrapPromotion[] {
  const promotions: CmsBootstrapPromotion[] = [];

  for (const item of readArray(input)) {
    const parsed = parseBootstrapPromotion(item);
    if (parsed) {
      promotions.push(parsed);
    }
  }

  return promotions;
}

function parseBootstrapPromotion(
  item: unknown,
): CmsBootstrapPromotion | undefined {
  const value = readObject(item);
  if (!value) {
    return undefined;
  }

  const title = readString(value.title);
  if (!title) {
    return undefined;
  }

  const cta = readObject(value.cta);
  const ctaLabel = readString(cta?.label) ?? readString(value.ctaLabel);
  const destination = resolveDestination(cta ?? value);

  return {
    id: readString(value.id),
    title,
    eyebrow: readString(value.eyebrow),
    description: readString(value.description),
    placement: readString(value.placement),
    priority: readNumber(value.priority),
    ctaLabel,
    destination,
    ...(value.mobileImage !== undefined ? {mobileImage: value.mobileImage} : {}),
    ...(value.desktopImage !== undefined ? {desktopImage: value.desktopImage} : {}),
  };
}
