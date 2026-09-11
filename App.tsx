import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CmsClientProvider} from './src/cms/CmsClientProvider';
import {RootNavigator} from './src/navigation/RootNavigator';
import {navigationRef} from './src/navigation/navigationRef';
import {ContentRepositoryProvider} from './src/repository/ContentRepositoryProvider';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <CmsClientProvider>
        <ContentRepositoryProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <RootNavigator />
          </NavigationContainer>
        </ContentRepositoryProvider>
      </CmsClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
