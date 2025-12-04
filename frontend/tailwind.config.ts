import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020817",
        foreground: "#f9fafb",
        muted: "#1f2937",
        accent: "#22d3ee",
        card: "#0b1220"
      },
      borderRadius: {
        lg: "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;



