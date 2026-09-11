import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CmsClientProvider} from './src/cms/CmsClientProvider';
import {ContentRepositoryProvider} from './src/repository/ContentRepositoryProvider';
import {HomeScreen} from './src/screens/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <CmsClientProvider>
        <ContentRepositoryProvider>
          <NavigationContainer>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <HomeScreen />
          </NavigationContainer>
        </ContentRepositoryProvider>
      </CmsClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
