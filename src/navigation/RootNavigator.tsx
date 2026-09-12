import type {ComponentType, ReactNode} from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {AppUpdateProvider} from '../cms/AppUpdateProvider';
import {CmsAlertProvider} from '../cms/CmsAlertProvider';
import {CmsBootstrapProvider} from '../cms/CmsBootstrapProvider';
import type {CmsBootstrap} from '../cms/bootstrap';
import {useCmsBootstrap} from '../hooks/useCmsBootstrap';
import {useGlassChrome} from '../hooks/useGlassChrome';
import {AppUpdateGate} from '../screens/AppUpdateScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {MenuScreen} from '../screens/MenuScreen';
import {PrivacyScreen} from '../screens/PrivacyScreen';
import {ReservationsScreen} from '../screens/ReservationsScreen';
import {useTheme} from '../theme';
import {stackChromeOptions} from './stackChrome';
import {tabChromeStyle} from './tabChrome';
import {resolveTabIconKey, TabBarIcon} from './tabIcons';
import {
  privacyTabLabel,
  reservationsNavLabel,
  toTabRoutes,
  type MainTabParamList,
  type RootStackParamList,
  type TabRoute,
  type TabRouteName,
} from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_SCREENS: Record<TabRouteName, ComponentType> = {
  Home: HomeScreen,
  Menu: MenuScreen,
};

export function RootNavigator() {
  const {colors, isDark} = useTheme();
  const {allowGlass} = useGlassChrome();
  const {bootstrap, error, loading, reload} = useCmsBootstrap();

  if (loading && !bootstrap) {
    return <LoadingState />;
  }

  if (error && !bootstrap) {
    return <ErrorState message={error.userMessage} onRetry={reload} />;
  }

  const tabRoutes = bootstrap ? toTabRoutes(bootstrap.navigation) : [];
  if (tabRoutes.length === 0) {
    return (
      <BootstrappedApp bootstrap={bootstrap}>
        <HomeScreen />
      </BootstrappedApp>
    );
  }

  const privacyLabel = bootstrap
    ? privacyTabLabel(bootstrap.navigation)
    : undefined;
  const reservationsLabel = bootstrap
    ? reservationsNavLabel(bootstrap.navigation)
    : undefined;

  return (
    <BootstrappedApp bootstrap={bootstrap}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.accent,
          headerTitleStyle: {color: colors.text},
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen name="Tabs" options={{headerShown: false}}>
          {() => <MainTabs routes={tabRoutes} />}
        </Stack.Screen>
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{
            title: privacyLabel ?? '',
            ...stackChromeOptions({
              allowGlass,
              isDark,
              colors,
              platform: Platform.OS,
            }),
          }}
        />
        <Stack.Screen
          name="Reservations"
          component={ReservationsScreen}
          options={{
            title: reservationsLabel ?? '',
            ...stackChromeOptions({
              allowGlass,
              isDark,
              colors,
              platform: Platform.OS,
            }),
          }}
        />
      </Stack.Navigator>
    </BootstrappedApp>
  );
}

function BootstrappedApp({
  bootstrap,
  children,
}: {
  bootstrap: CmsBootstrap | null;
  children: ReactNode;
}) {
  return (
    <CmsBootstrapProvider bootstrap={bootstrap}>
      <AppUpdateProvider update={bootstrap?.operationalControls?.appUpdate}>
        <AppUpdateGate>
          <CmsAlertProvider>{children}</CmsAlertProvider>
        </AppUpdateGate>
      </AppUpdateProvider>
    </CmsBootstrapProvider>
  );
}

function MainTabs({routes}: {routes: TabRoute[]}) {
  const {colors, minTouchTarget} = useTheme();
  const {allowGlass} = useGlassChrome();

  return (
    <Tab.Navigator
      initialRouteName={routes[0]?.name}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: tabChromeStyle({
          allowGlass,
          platform: Platform.OS,
          colors,
          minTouchTarget,
        }),
        tabBarItemStyle: {minHeight: minTouchTarget},
      }}>
      {routes.map(route => (
        <Tab.Screen
          key={route.name}
          name={route.name}
          component={TAB_SCREENS[route.name]}
          options={{
            title: route.label,
            tabBarLabel: route.label,
            tabBarAccessibilityLabel: route.label,
            tabBarButtonTestID: `cms-tab-${route.name}`,
            tabBarIcon: ({color, size}) => (
              <TabBarIcon
                iconKey={resolveTabIconKey(route.icon, route.name)}
                color={color}
                size={size}
                testID={`cms-tab-icon-${route.name}`}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
