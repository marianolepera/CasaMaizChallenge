export const lightColors = {
  background: '#F6F1EA',
  surface: '#FFFFFF',
  surfaceMuted: '#EDE4D8',
  text: '#1C1410',
  textMuted: '#6B574C',
  border: '#E2D3C6',
  accent: '#EF4938',
  accentText: '#FFFFFF',
  danger: '#B42318',
  overlay: 'rgba(28, 20, 16, 0.08)',
} as const;

export const darkColors = {
  background: '#16110E',
  surface: '#231C18',
  surfaceMuted: '#2E261F',
  text: '#F6F1EA',
  textMuted: '#C2B2A6',
  border: '#3D332C',
  accent: '#EF4938',
  accentText: '#FFFFFF',
  danger: '#FF6B5C',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};
