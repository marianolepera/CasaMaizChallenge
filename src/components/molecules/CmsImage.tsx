import {Image, StyleSheet, type ImageStyle, type StyleProp} from 'react-native';
import {resolveCmsImage} from '../../cms/media';
import {DEFAULT_API_BASE_URL} from '../../config/api';

export type CmsImageProps = {
  media: unknown;
  baseUrl?: string;
  style?: StyleProp<ImageStyle>;
};

export function CmsImage({
  media,
  baseUrl = DEFAULT_API_BASE_URL,
  style,
}: CmsImageProps) {
  const resolved = resolveCmsImage(media, baseUrl);
  if (!resolved) {
    return null;
  }

  const hasAlt = Boolean(resolved.alt);

  return (
    <Image
      source={{uri: resolved.uri}}
      resizeMode="cover"
      accessible={hasAlt}
      accessibilityLabel={resolved.alt}
      style={[styles.image, {aspectRatio: resolved.aspectRatio}, style]}
      {...(hasAlt ? {accessibilityRole: 'image' as const} : {})}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
  },
});
