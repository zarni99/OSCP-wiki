import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal base
        bg: "#080808",
        surface: "#101010",
        surface2: "#181818",
        border: "#252525",
        bright: "#e0dcd0",
        dim: "#707070",
        // Primary accent — amber (interactive: active states, copy, favorites)
        orange: "#cc9018",
        warn: "#bb8814",
        // Phase / category colors
        core: "#4898d8",      // blue  — recon / linux
        success: "#38c050",   // green — privesc / command text
        post: "#d07030",      // orange — post exploit / web
        adblue: "#7070d8",    // purple-blue — AD
        custom: "#48b868",    // green — custom commands
        // Supporting
        violet: "#9070e8",    // purple — search, secondary accents
        cyan: "#28b0c0",
        green: "#38c050",
        red: "#dd4040",
        danger: "#dd4040",
      },
      fontFamily: {
        mono: ["var(--font-share-tech-mono)", "monospace"],
        heading: ["var(--font-rajdhani)", "sans-serif"],
        body: ["var(--font-exo-2)", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
export default config;
