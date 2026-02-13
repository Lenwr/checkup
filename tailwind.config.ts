import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        greff: {
          50: "#F3FBF5",
          100: "#E7F7EB",
          200: "#C6ECCD",
          300: "#9FDEA9",
          400: "#66C97A",
          500: "#34B35A", // vert “action”
          600: "#2E7D32", // vert principal “Greff’Up”
          700: "#1B5E20", // vert foncé
          800: "#154A19",
          900: "#0F3512",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
