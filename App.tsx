import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CmsClientProvider} from './src/cms/CmsClientProvider';
import {appLinking} from './src/navigation/linking';
import {RootNavigator} from './src/navigation/RootNavigator';
import {navigationRef} from './src/navigation/navigationRef';
import {ContentRepositoryProvider} from './src/repository/ContentRepositoryProvider';
import {ThemeProvider, useTheme} from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <CmsClientProvider>
        <ContentRepositoryProvider>
          <ThemeProvider>
            <ThemedNavigation />
          </ThemeProvider>
        </ContentRepositoryProvider>
      </CmsClientProvider>
    </SafeAreaProvider>
  );
}

function ThemedNavigation() {
  const {isDark, navigationTheme} = useTheme();

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      linking={appLinking}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default App;
