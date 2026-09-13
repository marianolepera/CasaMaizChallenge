import {useContext, type ReactNode} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {HeaderHeightContext} from '@react-navigation/elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {Text} from '../components/atoms/Text';
import {useCmsLegal} from '../hooks/useCmsLegal';
import {useGlassChrome} from '../hooks/useGlassChrome';
import {useTheme} from '../theme';

export const LEGAL_TITLE_TEST_ID = 'cms-legal-title';
export const LEGAL_SUMMARY_TEST_ID = 'cms-legal-summary';
export const LEGAL_BODY_TEST_ID = 'cms-legal-body';

export function PrivacyScreen() {
  const {colors, spacing} = useTheme();
  const {document, error, loading, refreshing, reload, refresh} =
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
      <ScreenFrame>
        <LoadingState />
      </ScreenFrame>
    );
  }

  if (error && !document) {
    return (
      <ScreenFrame>
        <ErrorState message={error.userMessage} onRetry={reload} />
      </ScreenFrame>
    );
  }

  const hasContent = Boolean(
    document?.title || document?.summary || document?.body,
  );

  if (!document || !hasContent) {
    return (
      <ScreenFrame>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          refreshControl={refreshControl}>
          <EmptyState />
        </ScrollView>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame>
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
    </ScreenFrame>
  );
}

function ScreenFrame({children}: {children: ReactNode}) {
  const {colors} = useTheme();
  const {allowGlass} = useGlassChrome();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const topInset = allowGlass ? headerHeight : 0;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.safe,
        {backgroundColor: colors.background, paddingTop: topInset},
      ]}
      testID="privacy-screen">
      <CmsScreenBanners pageSlug="privacy_policy" />
      {children}
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
