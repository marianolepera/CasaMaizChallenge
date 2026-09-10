import {Text as RNText, type TextProps as RNTextProps} from 'react-native';
import {useTheme, type TypographyVariant} from '../../theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  muted?: boolean;
  color?: string;
};

export function Text({
  variant = 'body',
  muted = false,
  color,
  style,
  allowFontScaling = true,
  maxFontSizeMultiplier = 2,
  ...rest
}: TextProps) {
  const {colors, typography} = useTheme();

  return (
    <RNText
      {...rest}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typography[variant],
        {color: color ?? (muted ? colors.textMuted : colors.text)},
        style,
      ]}
    />
  );
}
