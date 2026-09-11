import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {OfflineBanner} from '../components/molecules/OfflineBanner';
import {Text} from '../components/atoms/Text';
import {useCmsLegal} from '../hooks/useCmsLegal';
import {useTheme} from '../theme';

export const LEGAL_TITLE_TEST_ID = 'cms-legal-title';
export const LEGAL_SUMMARY_TEST_ID = 'cms-legal-summary';
export const LEGAL_BODY_TEST_ID = 'cms-legal-body';

export function PrivacyScreen() {
  const {colors, spacing} = useTheme();
  const {document, error, loading, refreshing, source, reload, refresh} =
    useCmsLegal('privacy_policy');

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={colors.accent}
    />
  );

  if (loading && !document) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="privacy-screen">
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error && !document) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="privacy-screen">
        <ErrorState message={error.userMessage} onRetry={reload} />
      </SafeAreaView>
    );
  }

  const hasContent = Boolean(
    document?.title || document?.summary || document?.body,
  );

  if (!document || !hasContent) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={[styles.safe, {backgroundColor: colors.background}]}
        testID="privacy-screen">
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
      edges={['bottom']}
      style={[styles.safe, {backgroundColor: colors.background}]}
      testID="privacy-screen">
      {source === 'cache' ? <OfflineBanner onRetry={reload} /> : null}
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        }}>
        {document.title ? (
          <Text
            variant="title"
            accessibilityRole="header"
            testID={LEGAL_TITLE_TEST_ID}>
            {document.title}
          </Text>
        ) : null}
        {document.summary ? (
          <Text muted testID={LEGAL_SUMMARY_TEST_ID}>
            {document.summary}
          </Text>
        ) : null}
        {document.body ? (
          <View>
            <Text testID={LEGAL_BODY_TEST_ID}>{document.body}</Text>
          </View>
        ) : null}
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
