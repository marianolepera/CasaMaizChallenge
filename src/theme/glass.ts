export type GlassChrome = {
  allowGlass: boolean;
  reduceTransparency: boolean;
  reduceMotion: boolean;
};

export function resolveAllowGlass(
  platform: string,
  reduceTransparency: boolean,
): boolean {
  return platform === 'ios' && !reduceTransparency;
}

export function colorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function tabBarOverlayInset(
  bottomSafeArea: number,
  minTouchTarget: number,
): number {
  return minTouchTarget + bottomSafeArea;
}
