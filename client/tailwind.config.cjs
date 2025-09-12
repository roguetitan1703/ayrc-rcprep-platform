/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        background: "#1A1B26",
        "text-primary": "#EAEAEA",
        "text-secondary": "#A9A9A9",
        "accent-amber": "#FFC107",
        "success-green": "#19D895",
        "error-red": "#F44336",
        "neutral-grey": "#4A4A5A",
        "card-surface": "#2A2B3A",
      },
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans],
        serif: ["Inter", ...fontFamily.serif],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
