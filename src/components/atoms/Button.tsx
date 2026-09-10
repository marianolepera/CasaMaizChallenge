import {useMemo} from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '../../theme';
import {Text} from './Text';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const {colors, minTouchTarget, radius, spacing} = useTheme();
  const palette = useMemo(() => {
    if (variant === 'secondary') {
      return {
        background: colors.surface,
        border: colors.border,
        text: colors.text,
      };
    }
    return {
      background: colors.accent,
      border: colors.accent,
      text: colors.accentText,
    };
  }, [colors, variant]);

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: Boolean(disabled)}}
      disabled={disabled}
      android_ripple={{color: colors.overlay}}
      style={({pressed}) => [
        styles.base,
        {
          minHeight: minTouchTarget,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <Text variant="button" color={palette.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
