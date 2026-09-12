import {StyleSheet, View} from 'react-native';

export type SearchIconProps = {
  color: string;
  size?: number;
  testID?: string;
};

export function SearchIcon({color, size = 18, testID}: SearchIconProps) {
  const lens = size * 0.58;
  const handleWidth = 2;
  const handleHeight = size * 0.34;

  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, {width: size, height: size}]}>
      <View
        style={{
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: 2,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: handleWidth,
          height: handleHeight,
          backgroundColor: color,
          borderRadius: 1,
          bottom: 1,
          right: 1,
          transform: [{rotate: '-45deg'}],
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
});
