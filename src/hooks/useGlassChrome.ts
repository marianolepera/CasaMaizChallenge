import {useEffect, useState} from 'react';
import {AccessibilityInfo, Platform} from 'react-native';
import {resolveAllowGlass, type GlassChrome} from '../theme/glass';

export function useGlassChrome(): GlassChrome {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readAccessibilityFlag(AccessibilityInfo.isReduceTransparencyEnabled)
      .then(enabled => {
        if (!cancelled) {
          setReduceTransparency(enabled);
        }
      })
      .catch(() => undefined);

    readAccessibilityFlag(AccessibilityInfo.isReduceMotionEnabled)
      .then(enabled => {
        if (!cancelled) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => undefined);

    const transparency = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );
    const motion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      cancelled = true;
      transparency.remove();
      motion.remove();
    };
  }, []);

  return {
    reduceTransparency,
    reduceMotion,
    allowGlass: resolveAllowGlass(Platform.OS, reduceTransparency),
  };
}

async function readAccessibilityFlag(
  reader?: () => Promise<boolean>,
): Promise<boolean> {
  if (!reader) {
    return false;
  }

  try {
    return await reader();
  } catch {
    return false;
  }
}
