import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTheme} from '../../theme';
import {Text} from '../atoms/Text';

export type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = 'Cargando contenido',
}: LoadingStateProps) {
  const {colors, spacing} = useTheme();

  return (
    <View
      testID="cms-loading-state"
      style={[styles.container, {padding: spacing.lg, gap: spacing.md}]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.accent} />
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
