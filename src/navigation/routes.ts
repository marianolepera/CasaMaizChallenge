import type {NavigatorScreenParams} from '@react-navigation/native';
import type {CmsNavItem, CmsNavigation} from '../cms/bootstrap';

export const TAB_ROUTE_BY_PATH = {
  '/': 'Home',
  '/menu': 'Menu',
} as const;

export type TabRouteName = (typeof TAB_ROUTE_BY_PATH)[keyof typeof TAB_ROUTE_BY_PATH];

export type TabRoute = {
  name: TabRouteName;
  label: string;
  path: keyof typeof TAB_ROUTE_BY_PATH;
  icon?: string;
};

export type MainTabParamList = {
  Home: undefined;
  Menu: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Privacy: undefined;
};

export function toTabRoutes(navigation: CmsNavigation): TabRoute[] {
  const routes: TabRoute[] = [];
  const seen = new Set<TabRouteName>();

  for (const item of navigation.items) {
    const route = tabRouteFromItem(item);
    if (!route || seen.has(route.name)) {
      continue;
    }
    seen.add(route.name);
    routes.push(route);
  }

  return routes;
}

export function privacyTabLabel(navigation: CmsNavigation): string | undefined {
  for (const item of navigation.items) {
    if (
      item.destination.kind === 'internal' &&
      item.destination.path === '/legal/privacy_policy'
    ) {
      return item.label;
    }
  }
  return undefined;
}

function tabRouteFromItem(item: CmsNavItem): TabRoute | undefined {
  if (item.destination.kind !== 'internal') {
    return undefined;
  }

  const path = item.destination.path;
  if (path !== '/' && path !== '/menu') {
    return undefined;
  }

  return {
    name: TAB_ROUTE_BY_PATH[path],
    label: item.label,
    path,
    ...(item.icon ? {icon: item.icon} : {}),
  };
}
