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
        bg: "#070912",
        surface: "#0d1324",
        surface2: "#151d34",
        border: "#2a3a61",
        cyan: "#4fe6ff",
        red: "#ff5f7f",
        green: "#66ffb2",
        dim: "#90a0bf",
        bright: "#f2f6ff",
        orange: "#ffb14a",
        violet: "#9e86ff",
        core: "#49b8ff",
        adblue: "#7a8dff",
        post: "#ff9f5a",
        custom: "#7dff9b",
        warn: "#ffd166",
        danger: "#ff5f7f",
        success: "#66ffb2",
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
