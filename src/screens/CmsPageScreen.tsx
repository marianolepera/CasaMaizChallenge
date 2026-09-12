import {useState, type ReactNode} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {PageLayout} from '../blocks/PageLayout';
import {EmptyState} from '../components/molecules/EmptyState';
import {ErrorState} from '../components/molecules/ErrorState';
import {LoadingState} from '../components/molecules/LoadingState';
import {CmsScreenBanners} from '../components/molecules/CmsScreenBanners';
import {OfflineBanner} from '../components/molecules/OfflineBanner';
import {Input} from '../components/atoms/Input';
import {SearchIcon} from '../components/atoms/SearchIcon';
import {Text} from '../components/atoms/Text';
import type {PageSlug} from '../cms/contentClient';
import {filterLayoutByQuery} from '../cms/menuFilter';
import {useCmsPage} from '../hooks/useCmsPage';
import {useGlassChrome} from '../hooks/useGlassChrome';
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
  const {page, error, loading, refreshing, source, reload, refresh} =
    useCmsPage(slug);
  const [query, setQuery] = useState('');
  const visibleLayout = page
    ? filterLayoutByQuery(page.layout, searchable ? query : '')
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
          contentContainerStyle={[styles.flexGrow, {paddingBottom: overlayInset}]}
          refreshControl={refreshControl}>
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
      {source === 'cache' ? <OfflineBanner onRetry={reload} /> : null}
      {searchField}
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{paddingBottom: spacing.xl + overlayInset}}>
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

  return (
    <SafeAreaView
      edges={overlayInset > 0 ? ['top', 'left', 'right'] : undefined}
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
