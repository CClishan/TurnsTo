export interface ParsedColor {
  h: number;
  s: number;
  v: number;
  a: number;
  r: number;
  g: number;
  b: number;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clamp255 = (value: number) => Math.min(255, Math.max(0, value));

function hsvToRgb(hue: number, saturation: number, value: number) {
  const chroma = value * saturation;
  const segment = ((hue % 360) + 360) % 360 / 60;
  const second = chroma * (1 - Math.abs(segment % 2 - 1));
  const channels = segment < 1 ? [chroma, second, 0] : segment < 2 ? [second, chroma, 0] : segment < 3 ? [0, chroma, second] : segment < 4 ? [0, second, chroma] : segment < 5 ? [second, 0, chroma] : [chroma, 0, second];
  const minimum = value - chroma;
  return { r: (channels[0] + minimum) * 255, g: (channels[1] + minimum) * 255, b: (channels[2] + minimum) * 255 };
}

function rgbToHsv(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const delta = maximum - minimum;
  let hue = 0;
  if (delta) {
    if (maximum === r) hue = 60 * (((g - b) / delta) % 6);
    else if (maximum === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return { h: hue, s: maximum === 0 ? 0 : delta / maximum, v: maximum };
}

function rgbToHsl(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const delta = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  let hue = 0;
  if (delta) {
    if (maximum === r) hue = ((g - b) / delta) % 6;
    else if (maximum === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1)), l: lightness };
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = ((hue % 360) + 360) % 360 / 60;
  const second = chroma * (1 - Math.abs(segment % 2 - 1));
  const channels = segment < 1 ? [chroma, second, 0] : segment < 2 ? [second, chroma, 0] : segment < 3 ? [0, chroma, second] : segment < 4 ? [0, second, chroma] : segment < 5 ? [second, 0, chroma] : [chroma, 0, second];
  const minimum = lightness - chroma / 2;
  return { r: (channels[0] + minimum) * 255, g: (channels[1] + minimum) * 255, b: (channels[2] + minimum) * 255 };
}

function rgbToOklch(red: number, green: number, blue: number) {
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(red);
  const g = toLinear(green);
  const b = toLinear(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bChannel = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bChannel);
  const hue = (Math.atan2(bChannel, a) * 180 / Math.PI + 360) % 360;
  return { lightness, chroma, hue };
}

function oklchToRgb(lightness: number, chroma: number, hue: number) {
  const a = chroma * Math.cos(hue * Math.PI / 180);
  const b = chroma * Math.sin(hue * Math.PI / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const toSrgb = (value: number) => clamp255((value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055) * 255);
  return {
    r: toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function parseChannels(input: string) {
  return input.split(/[\s,/]+/).filter(Boolean);
}

function parseRawColor(input: string) {
  const value = input.trim();
  const hex = value.match(/^#?([0-9a-f]{3,8})$/i);
  if (hex) {
    const normalized = hex[1].length <= 4 ? hex[1].split("").map((channel) => channel + channel).join("") : hex[1];
    if (normalized.length === 6 || normalized.length === 8) return { r: parseInt(normalized.slice(0, 2), 16), g: parseInt(normalized.slice(2, 4), 16), b: parseInt(normalized.slice(4, 6), 16), a: normalized.length === 8 ? parseInt(normalized.slice(6, 8), 16) / 255 : 1 };
  }
  const rgb = value.match(/^rgba?\((.+)\)$/i);
  if (rgb) {
    const [red, green, blue, alpha = "1"] = parseChannels(rgb[1]);
    const a = alpha.endsWith("%") ? Number.parseFloat(alpha) / 100 : Number.parseFloat(alpha);
    if ([red, green, blue].every((channel) => !Number.isNaN(Number.parseFloat(channel))) && !Number.isNaN(a)) return { r: clamp255(Number.parseFloat(red)), g: clamp255(Number.parseFloat(green)), b: clamp255(Number.parseFloat(blue)), a: clamp01(a) };
  }
  const hsl = value.match(/^hsla?\((.+)\)$/i);
  if (hsl) {
    const [hue, saturation, lightness, alpha = "1"] = parseChannels(hsl[1]);
    const a = alpha.endsWith("%") ? Number.parseFloat(alpha) / 100 : Number.parseFloat(alpha);
    const rgbColor = hslToRgb(Number.parseFloat(hue), clamp01(Number.parseFloat(saturation) / 100), clamp01(Number.parseFloat(lightness) / 100));
    if (![rgbColor.r, rgbColor.g, rgbColor.b, a].some(Number.isNaN)) return { ...rgbColor, a: clamp01(a) };
  }
  const oklch = value.match(/^oklch\((.+)\)$/i);
  if (oklch) {
    const [lightness, chroma, hue, alpha = "1"] = parseChannels(oklch[1]);
    const a = alpha.endsWith("%") ? Number.parseFloat(alpha) / 100 : Number.parseFloat(alpha);
    const rgbColor = oklchToRgb(clamp01(Number.parseFloat(lightness) / (lightness.endsWith("%") ? 100 : 1)), Math.max(0, Number.parseFloat(chroma)), Number.parseFloat(hue));
    if (![rgbColor.r, rgbColor.g, rgbColor.b, a].some(Number.isNaN)) return { ...rgbColor, a: clamp01(a) };
  }
  return null;
}

export function buildParsedColor(hue: number, saturation: number, value: number, alpha: number): ParsedColor {
  const rgb = hsvToRgb(hue, saturation, value);
  const r = Math.round(clamp255(rgb.r));
  const g = Math.round(clamp255(rgb.g));
  const b = Math.round(clamp255(rgb.b));
  const hsl = rgbToHsl(r, g, b);
  const oklch = rgbToOklch(r, g, b);
  const a = clamp01(alpha);
  const hex = `#${[r, g, b, Math.round(a * 255)].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  const opaqueHex = hex.slice(0, 7).toUpperCase();
  return {
    h: hue,
    s: saturation,
    v: value,
    a,
    r,
    g,
    b,
    hex: a === 1 ? opaqueHex : hex.toUpperCase(),
    rgb: a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`,
    hsl: a === 1 ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)` : `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${Number(a.toFixed(3))})`,
    oklch: a === 1 ? `oklch(${(oklch.lightness * 100).toFixed(1)}% ${oklch.chroma.toFixed(3)} ${oklch.hue.toFixed(1)})` : `oklch(${(oklch.lightness * 100).toFixed(1)}% ${oklch.chroma.toFixed(3)} ${oklch.hue.toFixed(1)} / ${Number(a.toFixed(3))})`,
  };
}

export function parseColor(input: string): ParsedColor | null {
  const raw = parseRawColor(input);
  if (!raw) return null;
  const hsv = rgbToHsv(raw.r, raw.g, raw.b);
  return buildParsedColor(hsv.h, hsv.s, hsv.v, raw.a);
}
