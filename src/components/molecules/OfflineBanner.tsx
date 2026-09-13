import {useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text} from '../atoms/Text';

export const OFFLINE_BANNER_TEST_ID = 'cms-offline-banner';
export const OFFLINE_BANNER_MESSAGE =
  'No tenes internet. Revisa tu conexion';

const ENTER_MS = 250;
const BAR_BACKGROUND = '#1F2937';
const BAR_FOREGROUND = '#FFFFFF';
const ICON_SIZE = 20;

export type OfflineBannerProps = {
  message?: string;
  includeTopInset?: boolean;
};

export function OfflineBanner({
  message = OFFLINE_BANNER_MESSAGE,
  includeTopInset = false,
}: OfflineBannerProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => {
        if (!cancelled) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduceMotion ? 0 : ENTER_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.bar,
        includeTopInset ? {paddingTop: insets.top} : null,
        {opacity},
      ]}>
      <View
        testID={OFFLINE_BANNER_TEST_ID}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={message}
        style={styles.row}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={styles.icon}>
          <Text
            allowFontScaling={false}
            color={BAR_FOREGROUND}
            variant="caption"
            style={styles.iconGlyph}>
            !
          </Text>
        </View>
        <Text
          color={BAR_FOREGROUND}
          maxFontSizeMultiplier={1.2}
          numberOfLines={2}
          variant="caption"
          style={styles.message}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: BAR_BACKGROUND,
  },
  row: {
    minHeight: 40,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 1.5,
    borderColor: BAR_FOREGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  message: {
    flexShrink: 1,
    fontWeight: '600',
  },
});
