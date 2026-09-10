import {StyleSheet, View} from 'react-native';
import {getBlockKey} from '../cms/page';
import type {CmsBlock} from '../cms/page';
import {getBlockComponent} from './registry';
import {useTheme} from '../theme';

export type PageLayoutProps = {
  layout: CmsBlock[];
};

export function PageLayout({layout}: PageLayoutProps) {
  const {spacing} = useTheme();

  return (
    <View testID="cms-page-layout" style={[styles.layout, {gap: spacing.lg}]}>
      {layout.map((block, index) => {
        const Block = getBlockComponent(block.blockType);
        return <Block key={getBlockKey(block, index)} block={block} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    width: '100%',
  },
});
