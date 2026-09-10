import {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '../../theme';

export type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  containerStyle,
  style,
  editable = true,
  accessibilityLabel,
  placeholder,
  ...rest
}: InputProps) {
  const {colors, minTouchTarget, radius, spacing, typography} = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...rest}
      editable={editable}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      placeholderTextColor={colors.textMuted}
      allowFontScaling
      maxFontSizeMultiplier={2}
      onFocus={event => {
        setFocused(true);
        rest.onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        rest.onBlur?.(event);
      }}
      style={[
        styles.input,
        typography.body,
        {
          minHeight: minTouchTarget,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderColor: focused ? colors.accent : colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
        },
        !editable && styles.disabled,
        containerStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
