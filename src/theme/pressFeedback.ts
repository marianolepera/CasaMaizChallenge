export function pressOpacity(
  platform: string,
  pressed: boolean,
  disabled = false,
): number {
  if (disabled) {
    return 0.5;
  }

  if (platform === 'android') {
    return 1;
  }

  return pressed ? 0.85 : 1;
}

export function androidRippleColor(
  platform: string,
  color: string,
): {color: string} | undefined {
  if (platform !== 'android') {
    return undefined;
  }

  return {color};
}
