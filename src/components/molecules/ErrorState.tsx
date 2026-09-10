import {StyleSheet, View} from 'react-native';
import {useTheme} from '../../theme';
import {Button} from '../atoms/Button';
import {Text} from '../atoms/Text';

export type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'No pudimos cargar el contenido',
  message,
  actionLabel = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  const {spacing} = useTheme();

  return (
    <View
      testID="cms-error-state"
      style={[styles.container, {padding: spacing.lg, gap: spacing.md}]}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      <Text muted>{message}</Text>
      {onRetry ? (
        <Button label={actionLabel} onPress={onRetry} />
      ) : null}
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
