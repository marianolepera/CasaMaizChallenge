import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PageLayout} from '../blocks/PageLayout';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {OfflineBanner} from '../components/molecules/OfflineBanner';
import {Text} from '../components/atoms/Text';
import {useCmsPage} from '../hooks/useCmsPage';
import {useTheme} from '../theme';

export function HomeScreen() {
  const {colors, spacing} = useTheme();
  const {page, error, loading, refreshing, source, reload, refresh} =
    useCmsPage('home');

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={colors.accent}
    />
  );

  if (loading && !page) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="home-screen">
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error && !page) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="home-screen">
        <ErrorState message={error.userMessage} onRetry={reload} />
      </SafeAreaView>
    );
  }

  if (!page || page.layout.length === 0) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="home-screen">
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          refreshControl={refreshControl}>
          <EmptyState />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.background}]}
      testID="home-screen">
      {source === 'cache' ? <OfflineBanner onRetry={reload} /> : null}
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{paddingBottom: spacing.xl}}>
        {page.title ? (
          <View style={{paddingHorizontal: spacing.md, paddingBottom: spacing.sm}}>
            <Text variant="title" accessibilityRole="header">
              {page.title}
            </Text>
          </View>
        ) : null}
        <PageLayout layout={page.layout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
});
