/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#efffc6",
          dark: "#121212",
        },
        primary: {
          DEFAULT: "#22c55e",
        },
        surface: {
          light: "#F0F0F0",
          dark: "#212121",
        },
        text: {
          light: "#020617",
          dark: "#f9fafb",
        },
        muted: {
          light: "#6b7280",
          dark: "#9ca3af",
        },
      },
    },
  },
  plugins: [],
};
