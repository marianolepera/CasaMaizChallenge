import type {ReactNode} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PageLayout} from '../blocks/PageLayout';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {OfflineBanner} from '../components/molecules/OfflineBanner';
import {Text} from '../components/atoms/Text';
import type {PageSlug} from '../cms/contentClient';
import {useCmsPage} from '../hooks/useCmsPage';
import {useTheme} from '../theme';

export type CmsPageScreenProps = {
  slug: PageSlug;
  testID: string;
  toolbar?: ReactNode;
};

export function CmsPageScreen({slug, testID, toolbar}: CmsPageScreenProps) {
  const {colors, spacing} = useTheme();
  const {page, error, loading, refreshing, source, reload, refresh} =
    useCmsPage(slug);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={colors.accent}
    />
  );

  if (loading && !page) {
    return (
      <ScreenFrame testID={testID} toolbar={toolbar}>
        <LoadingState />
      </ScreenFrame>
    );
  }

  if (error && !page) {
    return (
      <ScreenFrame testID={testID} toolbar={toolbar}>
        <ErrorState message={error.userMessage} onRetry={reload} />
      </ScreenFrame>
    );
  }

  if (!page || page.layout.length === 0) {
    return (
      <ScreenFrame testID={testID} toolbar={toolbar}>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          refreshControl={refreshControl}>
          <EmptyState />
        </ScrollView>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame testID={testID} toolbar={toolbar}>
      {source === 'cache' ? <OfflineBanner onRetry={reload} /> : null}
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{paddingBottom: spacing.xl}}>
        {page.title ? (
          <View
            style={{paddingHorizontal: spacing.md, paddingBottom: spacing.sm}}>
            <Text variant="title" accessibilityRole="header">
              {page.title}
            </Text>
          </View>
        ) : null}
        <PageLayout layout={page.layout} />
      </ScrollView>
    </ScreenFrame>
  );
}

function ScreenFrame({
  testID,
  toolbar,
  children,
}: {
  testID: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const {colors, spacing} = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.background}]}
      testID={testID}>
      {toolbar ? (
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.xs,
            alignItems: 'flex-end',
          }}>
          {toolbar}
        </View>
      ) : null}
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
