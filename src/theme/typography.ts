export const typography = {
  eyebrow: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.6,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
