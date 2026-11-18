/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Verde aproximado del mockup
        brand: { DEFAULT: "#2FAE72", dark: "#1F8A58", light: "#CFF1DF" },
      },
    },
  },
  plugins: [],
};