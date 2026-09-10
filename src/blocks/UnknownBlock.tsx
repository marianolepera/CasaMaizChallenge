import {StyleSheet, View} from 'react-native';
import {Text} from '../components/atoms/Text';
import {useTheme} from '../theme';
import type {BlockProps} from './types';

export const UNKNOWN_BLOCK_TEST_ID = 'cms-unknown-block';

export function UnknownBlock({block}: BlockProps) {
  const {spacing} = useTheme();

  return (
    <View
      testID={UNKNOWN_BLOCK_TEST_ID}
      accessibilityRole="text"
      accessibilityLabel="Este contenido no está disponible"
      style={[styles.container, {paddingVertical: spacing.sm}]}>
      {__DEV__ ? (
        <Text muted variant="caption">
          {`Bloque no soportado: ${block.blockType}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 1,
  },
});
