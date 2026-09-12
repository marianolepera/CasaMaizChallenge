import {useState, type ReactNode} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '../../theme';

export type InputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  leading?: ReactNode;
};

export function Input({
  containerStyle,
  leading,
  style,
  editable = true,
  accessibilityLabel,
  placeholder,
  ...rest
}: InputProps) {
  const {colors, minTouchTarget, radius, spacing, typography} = useTheme();
  const [focused, setFocused] = useState(false);
  const fieldChrome = {
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    borderColor: focused ? colors.accent : colors.border,
    backgroundColor: colors.surface,
  };

  const input = (
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
        typography.body,
        {
          color: colors.text,
          paddingHorizontal: spacing.md,
        },
        leading
          ? styles.inputWithLeading
          : [styles.input, fieldChrome, !editable && styles.disabled],
        style,
      ]}
    />
  );

  if (!leading) {
    return input;
  }

  return (
    <View
      style={[
        styles.field,
        fieldChrome,
        {
          paddingLeft: spacing.md,
          gap: spacing.sm,
        },
        !editable && styles.disabled,
        containerStyle,
      ]}>
      {leading}
      {input}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
  inputWithLeading: {
    flex: 1,
    paddingLeft: 0,
  },
  field: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
});
