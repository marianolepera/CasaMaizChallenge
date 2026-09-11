import {StyleSheet, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {CmsImage} from '../components/molecules/CmsImage';
import {useTheme} from '../theme';
import {readString} from './fields';
import type {BlockProps} from './types';

export const IMAGE_BLOCK_TEST_ID = 'cms-image-block';
export const IMAGE_BLOCK_CAPTION_TEST_ID = 'cms-image-block-caption';

export function ImageBlock({block}: BlockProps) {
  const {spacing} = useTheme();
  const media = block.mobileImage ?? block.image;
  const caption = readString(block.caption);
  const fullBleed = block.fullBleed === true;

  if (!media && !caption) {
    return null;
  }

  return (
    <View
      testID={IMAGE_BLOCK_TEST_ID}
      style={[
        styles.container,
        {gap: spacing.xs, paddingHorizontal: fullBleed ? 0 : spacing.md},
      ]}>
      <CmsImage media={media} />
      {caption ? (
        <Text
          muted
          variant="caption"
          testID={IMAGE_BLOCK_CAPTION_TEST_ID}
          style={fullBleed ? {paddingHorizontal: spacing.md} : undefined}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
