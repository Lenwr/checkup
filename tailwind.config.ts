import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // au cas où
  ],
  theme: {
    extend: {
      colors: {
        greff: {
          50:  "#F3FBF4",
          100: "#E3F6E6",
          200: "#C4ECCB",
          300: "#98DEA4",
          400: "#6CCD7B",
          500: "#2E7D32",
          600: "#1B5E20",
          700: "#144A19",
          800: "#0F3512",
          900: "#0B240C",
        },
        ink: {
          50: "#F8FAFC",
          100:"#F1F5F9",
          200:"#E2E8F0",
          300:"#CBD5E1",
          400:"#94A3B8",
          500:"#64748B",
          600:"#475569",
          700:"#334155",
          800:"#1F2937",
          900:"#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)",
        lift: "0 12px 36px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
