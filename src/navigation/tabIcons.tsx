import {StyleSheet, View} from 'react-native';
import type {TabRouteName} from './routes';

export type TabIconKey = 'home' | 'menu' | 'info';

const KNOWN_TAB_ICONS = new Set<string>(['home', 'menu', 'info']);

const ROUTE_FALLBACK: Record<TabRouteName, TabIconKey> = {
  Home: 'home',
  Menu: 'menu',
};

export function resolveTabIconKey(
  cmsIcon: string | undefined,
  routeName: TabRouteName,
): TabIconKey {
  if (cmsIcon && KNOWN_TAB_ICONS.has(cmsIcon)) {
    return cmsIcon as TabIconKey;
  }

  return ROUTE_FALLBACK[routeName];
}

export function TabBarIcon({
  iconKey,
  color,
  size,
  testID,
}: {
  iconKey: TabIconKey;
  color: string;
  size: number;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, {width: size, height: size}]}>
      {renderGlyph(iconKey, color, size)}
    </View>
  );
}

function renderGlyph(iconKey: TabIconKey, color: string, size: number) {
  if (iconKey === 'menu') {
    return <MenuGlyph color={color} size={size} />;
  }

  if (iconKey === 'info') {
    return <InfoGlyph color={color} size={size} />;
  }

  return <HomeGlyph color={color} size={size} />;
}

function HomeGlyph({color, size}: {color: string; size: number}) {
  const roof = size * 0.38;
  const bodyWidth = size * 0.52;
  const bodyHeight = size * 0.36;

  return (
    <View style={styles.center}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: roof,
          borderRightWidth: roof,
          borderBottomWidth: roof,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function MenuGlyph({color, size}: {color: string; size: number}) {
  const lineHeight = Math.max(2, Math.round(size * 0.08));
  const lineWidth = size * 0.72;
  const lineStyle = {
    height: lineHeight,
    width: lineWidth,
    backgroundColor: color,
    borderRadius: lineHeight,
  };

  return (
    <View style={[styles.center, {gap: size * 0.14}]}>
      <View style={lineStyle} />
      <View style={lineStyle} />
      <View style={lineStyle} />
    </View>
  );
}

function InfoGlyph({color, size}: {color: string; size: number}) {
  const diameter = size * 0.78;
  const stem = Math.max(2, Math.round(size * 0.1));

  return (
    <View
      style={[
        styles.center,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth: Math.max(2, Math.round(size * 0.08)),
          borderColor: color,
          gap: size * 0.06,
        },
      ]}>
      <View
        style={{
          width: stem,
          height: stem,
          borderRadius: stem / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: stem,
          height: size * 0.22,
          borderRadius: stem / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
