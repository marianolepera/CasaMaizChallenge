import {CmsPageScreen} from './CmsPageScreen';
import {AppearanceControl} from '../theme/AppearanceControl';

export function HomeScreen() {
  return (
    <CmsPageScreen
      slug="home"
      testID="home-screen"
      toolbar={<AppearanceControl />}
    />
  );
}
