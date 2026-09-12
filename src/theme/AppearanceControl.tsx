import {useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {androidRippleColor, pressOpacity} from './pressFeedback';
import {useTheme} from './ThemeProvider';

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 26;
const TRACK_PADDING = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;
const ANIMATION_MS = 220;

const SUN_COLOR = '#E7A11A';
const MOON_COLOR = '#1C1410';
const THUMB_COLOR = '#FFFFFF';
const NIGHT_TRACK = '#2A2420';

export function AppearanceControl() {
  const {colors, isDark, minTouchTarget, setPreference} = useTheme();
  const ripple = androidRippleColor(Platform.OS, colors.overlay);
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const isFirstRender = useRef(true);

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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.setValue(isDark ? 1 : 0);
      return;
    }

    Animated.timing(progress, {
      toValue: isDark ? 1 : 0,
      duration: reduceMotion ? 0 : ANIMATION_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isDark, progress, reduceMotion]);

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });
  const sunOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const moonOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Pressable
      testID="cms-appearance-control"
      accessibilityRole="switch"
      accessibilityLabel="Modo oscuro"
      accessibilityState={{checked: isDark}}
      onPress={() => setPreference(isDark ? 'light' : 'dark')}
      android_ripple={
        ripple
          ? {...ripple, borderless: true, radius: minTouchTarget / 2}
          : undefined
      }
      style={({pressed}) => [
        styles.hitTarget,
        {
          minHeight: minTouchTarget,
          minWidth: minTouchTarget,
          opacity: pressOpacity(Platform.OS, pressed),
        },
      ]}>
      <View
        style={[
          styles.track,
          {backgroundColor: colors.surfaceMuted, borderRadius: TRACK_HEIGHT / 2},
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.trackFill,
            {
              backgroundColor: NIGHT_TRACK,
              borderRadius: TRACK_HEIGHT / 2,
              opacity: moonOpacity,
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: THUMB_COLOR,
              transform: [{translateX: thumbTranslateX}],
            },
          ]}>
          <Animated.View style={[styles.glyph, {opacity: sunOpacity}]}>
            <SunIcon />
          </Animated.View>
          <Animated.View style={[styles.glyph, {opacity: moonOpacity}]}>
            <MoonIcon />
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

function SunIcon() {
  return (
    <View style={styles.sun}>
      <View style={styles.sunCore} />
      <View style={[styles.sunRay, styles.sunRayNorth]} />
      <View style={[styles.sunRay, styles.sunRayEast]} />
      <View style={[styles.sunRay, styles.sunRaySouth]} />
      <View style={[styles.sunRay, styles.sunRayWest]} />
    </View>
  );
}

function MoonIcon() {
  return (
    <View style={styles.moon}>
      <View style={styles.moonCutout} />
    </View>
  );
}

const styles = StyleSheet.create({
  hitTarget: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  trackFill: {
    ...StyleSheet.absoluteFill,
  },
  thumb: {
    position: 'absolute',
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUN_COLOR,
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 3,
    borderRadius: 1,
    backgroundColor: SUN_COLOR,
  },
  sunRayNorth: {
    top: 0,
  },
  sunRayEast: {
    right: 0,
    top: 5,
    width: 3,
    height: 2,
  },
  sunRaySouth: {
    bottom: 0,
  },
  sunRayWest: {
    left: 0,
    top: 5,
    width: 3,
    height: 2,
  },
  moon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: MOON_COLOR,
    overflow: 'hidden',
  },
  moonCutout: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THUMB_COLOR,
  },
});
