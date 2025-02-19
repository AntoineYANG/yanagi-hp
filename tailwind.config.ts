import type { Config } from "tailwindcss";


function interpolateColor(color1: string, color2: string, t: number): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color1) || !/^#[0-9A-Fa-f]{6}$/.test(color2)) {
    throw new Error('Invalid color format. Colors must be in the format "#RRGGBB".');
  }

  if (t < 0 || t > 1) {
    throw new Error('The interpolation factor t must be between 0 and 1.');
  }

  // Convert the hex color to RGB components
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Convert RGB components back to hex color
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  // Extract RGB components from both colors
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Interpolate each channel
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

  // Convert interpolated RGB back to hex
  return rgbToHex(r, g, b);
}

export const white = "#fcfcfc";
export const black = "#161616";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(i => [i, interpolateColor(white, black, i / 1_000)])),
      },
    },
  },
  plugins: [],
} satisfies Config;
