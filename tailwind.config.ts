import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      // globals.css applies the responsive gutters through the container width.
      padding: "0",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        input: "var(--input)",
        ring: "var(--ring)",
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        card: { DEFAULT: "var(--card)", foreground: "var(--foreground)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter Tight", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"],
      },
      letterSpacing: {
        display: "var(--tracking-display)",
        heading: "var(--tracking-heading)",
        label: "var(--tracking-label)",
      },
      borderRadius: {
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      transitionTimingFunction: { editorial: "var(--ease)" },
    },
  },
  plugins: [],
};
export default config;
