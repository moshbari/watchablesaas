// Hex <-> HSL helpers + complementary color (hue + 180°)
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export type ComplementaryMode = 'balanced' | 'pure';

/**
 * Returns the complementary color on the HSL wheel.
 * - 'pure': strict 180° hue rotation, preserves original saturation & lightness (true color-theory complement).
 * - 'balanced': 180° hue rotation but clamps S/L into a legible mid-range so the pair stays visible on UI.
 */
export function complementaryColor(hex: string, mode: ComplementaryMode = 'balanced'): string {
  const { h, s, l } = hexToHsl(hex);
  if (mode === 'pure') {
    return hslToHex(h + 180, s, l);
  }
  const newS = Math.max(0.55, Math.min(0.85, s || 0.7));
  const newL = Math.max(0.4, Math.min(0.6, l || 0.5));
  return hslToHex(h + 180, newS, newL);
}
