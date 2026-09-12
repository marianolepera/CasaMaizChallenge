import type {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppUpdate} from '../cms/AppUpdateProvider';
import {
  APP_UPDATE_MESSAGE_TEST_ID,
  APP_UPDATE_TEST_ID,
} from '../components/molecules/AppUpdateNotice';
import {Text} from '../components/atoms/Text';
import {useTheme} from '../theme';

export type AppUpdateScreenProps = {
  message: string;
};

export function AppUpdateScreen({message}: AppUpdateScreenProps) {
  const {colors, spacing} = useTheme();

  return (
    <SafeAreaView
      testID={APP_UPDATE_TEST_ID}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={message}
      style={[styles.safe, {backgroundColor: colors.background}]}>
      <View style={[styles.body, {padding: spacing.lg}]}>
        <Text variant="body" testID={APP_UPDATE_MESSAGE_TEST_ID}>
          {message}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export function AppUpdateGate({children}: {children: ReactNode}) {
  const {requiredMessage} = useAppUpdate();
  if (requiredMessage) {
    return <AppUpdateScreen message={requiredMessage} />;
  }

  return children;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
