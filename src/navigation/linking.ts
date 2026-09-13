import {
  getStateFromPath as getStateFromPathDefault,
  type LinkingOptions,
} from '@react-navigation/native';
import {DEEP_LINK_SCHEME, parseDeepLink} from './deepLinks';
import {handleResolvedDestination} from './destinations';
import type {RootStackParamList} from './routes';

export const linkingPrefixes = [`${DEEP_LINK_SCHEME}://`] as const;

export function destinationFromLinkingPath(path: string) {
  const trimmed = path.replace(/^\//, '');
  const url =
    trimmed === ''
      ? `${DEEP_LINK_SCHEME}://`
      : `${DEEP_LINK_SCHEME}://${trimmed}`;

  return parseDeepLink(url);
}

export const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [...linkingPrefixes],
  config: {
    screens: {
      Tabs: {
        path: '',
        screens: {
          Home: '',
          Menu: 'menu',
        },
      },
      Privacy: 'legal/privacy_policy',
      Reservations: 'reservas',
    },
  },
  getStateFromPath(path, options) {
    const destination = destinationFromLinkingPath(path);

    if (destination.kind !== 'internal') {
      handleResolvedDestination(destination);
      return undefined;
    }

    const state = getStateFromPathDefault(path, options);
    if (!state) {
      return undefined;
    }

    const active = state.routes[state.index ?? state.routes.length - 1];
    if (
      active?.name === 'Privacy' ||
      active?.name === 'Reservations'
    ) {
      const alreadyHasTabs = state.routes.some(route => route.name === 'Tabs');
      if (alreadyHasTabs) {
        return state;
      }

      return {
        ...state,
        index: 1,
        routes: [
          {
            name: 'Tabs' as const,
            state: {
              routes: [{name: 'Home' as const}],
              index: 0,
            },
          },
          ...state.routes,
        ],
      };
    }

    return state;
  },
};
