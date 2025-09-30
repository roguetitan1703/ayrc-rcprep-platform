/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    // Only keep dynamically applied classes, if any
    'bg-gradient-primary',
    'bg-gradient-accent',
    'bg-gradient-warm',
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {     
        'primary': "#6366f1",
        'primary-light': "#8b5cf6",
        'primary-dark': "#5558e3",
        'text-primary': "#e8eaed",
        'text-secondary': "#a9a9a9",
        'accent-amber': "#fb923c",
        'success-green': "#10b981",
        'error-red': "#ef4444",
        'neutral-grey': "#4A4A5A",
        'card-surface': "#16213e",
        'background': "#1a1d2e",
      },
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans],
        serif: ["Inter", ...fontFamily.serif],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom, #1a1d2e, #16213e)',
        'gradient-accent': 'linear-gradient(to right, #6366f1, #8b5cf6)',
        'gradient-warm': 'linear-gradient(to right, #ea580c, #fb923c)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};  