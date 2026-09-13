import {useMemo, type ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';


export function ConsumeTopSafeArea({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  const metrics = useMemo(
    () => ({
      frame,
      insets: active ? {...insets, top: 0} : insets,
    }),
    [active, frame, insets],
  );

  return (
    <SafeAreaProvider initialMetrics={metrics} style={styles.fill}>
      {children}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
