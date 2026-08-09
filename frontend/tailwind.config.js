/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MediScanQR brand system — one identity shared by all four portals.
        // Primary brand pink: actions, active nav, links, QR-related CTAs.
        brand: {
          50: "#fff0f6",
          100: "#ffe0ed",
          200: "#ffc2db",
          300: "#ff94bd",
          400: "#ff5a97",
          500: "#e9005b", // MediScanQR pink
          600: "#c8004d",
          700: "#a30040",
          800: "#800233",
          900: "#67062b",
        },
        // Secondary cyan/blue: QR scanning, technology, informational accents.
        accent: {
          50: "#eefaff",
          100: "#d9f3ff",
          200: "#b8eaff",
          300: "#84dcff",
          400: "#48c7ff",
          500: "#16a9e0", // MediScanQR cyan
          600: "#0885b8",
          700: "#086a94",
          800: "#0c587a",
          900: "#0f4a67",
        },
        // Near-black: headings, admin chrome, strong text/authority.
        ink: {
          DEFAULT: "#171717",
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#c7c7c7",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#262626",
          800: "#1f1f1f",
          900: "#171717",
        },
        // Application background.
        surface: "#f7f8fa",
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
