import {StyleSheet, View} from 'react-native';
import {useTheme} from '../../theme';
import {Text} from '../atoms/Text';

export type EmptyStateProps = {
  title?: string;
  message?: string;
};

export function EmptyState({
  title = 'No hay contenido por ahora',
  message = 'Volvé a intentar en unos minutos.',
}: EmptyStateProps) {
  const {spacing} = useTheme();

  return (
    <View
      testID="cms-empty-state"
      style={[styles.container, {padding: spacing.lg, gap: spacing.sm}]}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      <Text muted>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
