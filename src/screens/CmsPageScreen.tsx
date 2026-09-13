import {useState, type ReactNode} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {PageLayout} from '../blocks/PageLayout';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {HomeBootstrapFeatures} from '../components/molecules/BootstrapPromotions';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {Input} from '../components/atoms/Input';
import {SearchIcon} from '../components/atoms/SearchIcon';
import {Text} from '../components/atoms/Text';
import {useBootstrap} from '../cms/CmsBootstrapProvider';
import type {PageSlug} from '../cms/contentClient';
import {applyHomeFeatureFlags} from '../cms/featureFlags';
import {filterLayoutByQuery} from '../cms/menuFilter';
import {useCmsPage} from '../hooks/useCmsPage';
import {useGlassChrome} from '../hooks/useGlassChrome';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {tabBarOverlayInset, useTheme} from '../theme';

export const MENU_SEARCH_INPUT_TEST_ID = 'cms-menu-search';
export const MENU_SEARCH_ICON_TEST_ID = 'cms-menu-search-icon';

export type CmsPageScreenProps = {
  slug: PageSlug;
  testID: string;
  toolbar?: ReactNode;
  searchable?: boolean;
};

export function CmsPageScreen({
  slug,
  testID,
  toolbar,
  searchable = false,
}: CmsPageScreenProps) {
  const {colors, minTouchTarget, spacing} = useTheme();
  const {allowGlass} = useGlassChrome();
  const insets = useSafeAreaInsets();
  const overlayInset = allowGlass
    ? tabBarOverlayInset(insets.bottom, minTouchTarget)
    : 0;
  const {page, error, loading, refreshing, reload, refresh} = useCmsPage(slug);
  const bootstrap = useBootstrap();
  const [query, setQuery] = useState('');
  const pageLayout = page
    ? slug === 'home'
      ? applyHomeFeatureFlags(page.layout, bootstrap?.featureFlags)
      : page.layout
    : [];
  const visibleLayout = page
    ? filterLayoutByQuery(pageLayout, searchable ? query : '')
    : [];
  const searchField = searchable ? (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
      }}>
      <Input
        testID={MENU_SEARCH_INPUT_TEST_ID}
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar en el menú"
        accessibilityLabel="Buscar en el menú"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        leading={
          <SearchIcon
            color={colors.textMuted}
            testID={MENU_SEARCH_ICON_TEST_ID}
          />
        }
      />
    </View>
  ) : null;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={colors.accent}
    />
  );

  if (loading && !page) {
    return (
      <ScreenFrame
        testID={testID}
        toolbar={toolbar}
        pageSlug={slug}
        overlayInset={overlayInset}>
        <View style={{flex: 1, paddingBottom: overlayInset}}>
          <LoadingState />
        </View>
      </ScreenFrame>
    );
  }

  if (error && !page) {
    return (
      <ScreenFrame
        testID={testID}
        toolbar={toolbar}
        pageSlug={slug}
        overlayInset={overlayInset}>
        <View style={{flex: 1, paddingBottom: overlayInset}}>
          <ErrorState message={error.userMessage} onRetry={reload} />
        </View>
      </ScreenFrame>
    );
  }

  if (!page || page.layout.length === 0) {
    return (
      <ScreenFrame
        testID={testID}
        toolbar={toolbar}
        pageSlug={slug}
        overlayInset={overlayInset}>
        {searchField}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.flexGrow, {paddingBottom: overlayInset}]}
          refreshControl={refreshControl}>
          {slug === 'home' ? (
            <HomeBootstrapFeatures layout={pageLayout} />
          ) : null}
          <EmptyState />
        </ScrollView>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame
      testID={testID}
      toolbar={toolbar}
      pageSlug={slug}
      overlayInset={overlayInset}>
      {searchField}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        refreshControl={refreshControl}
        contentContainerStyle={{paddingBottom: spacing.xl + overlayInset}}>
        {slug === 'home' ? <HomeBootstrapFeatures layout={pageLayout} /> : null}
        {page.title ? (
          <View
            style={{paddingHorizontal: spacing.md, paddingBottom: spacing.sm}}>
            <Text variant="title" accessibilityRole="header">
              {page.title}
            </Text>
          </View>
        ) : null}
        {visibleLayout.length > 0 ? (
          <PageLayout layout={visibleLayout} />
        ) : (
          <EmptyState
            title="Sin resultados"
            message="Probá con otro plato o bebida."
          />
        )}
      </ScrollView>
    </ScreenFrame>
  );
}

function ScreenFrame({
  testID,
  toolbar,
  pageSlug,
  overlayInset,
  children,
}: {
  testID: string;
  toolbar?: ReactNode;
  pageSlug: string;
  overlayInset: number;
  children: ReactNode;
}) {
  const {colors, spacing} = useTheme();
  const isOnline = useNetworkStatus();
  const edges = !isOnline
    ? overlayInset > 0
      ? (['left', 'right'] as const)
      : (['bottom', 'left', 'right'] as const)
    : overlayInset > 0
      ? (['top', 'left', 'right'] as const)
      : undefined;

  return (
    <SafeAreaView
      edges={edges}
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
      <CmsScreenBanners pageSlug={pageSlug} />
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
