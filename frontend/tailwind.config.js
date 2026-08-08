import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shared chrome (logo, links, primary actions) across all roles.
        brand: colors.sky,
        // Role-specific accents so each portal reads as a distinct application
        // rather than the same UI with a different sidebar link.
        admin: colors.indigo,
        clinical: colors.sky,
        care: colors.emerald,
        dispense: colors.amber,
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
