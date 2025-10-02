/**
 * Unified Tailwind config (ESM) – remove duplicate .cjs to ensure Tailwind actually loads this file.
 * Project uses "type": "module" so we export with `export default`.
 */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: ['bg-gradient-primary', 'bg-gradient-accent', 'bg-gradient-warm'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // === Signature Light Theme (Crimson Trust) ===
        // Keeping original keys so existing component classes keep working.
        // Palette reference: https://coolors.co/f7f8fc-273043-d33f49-1a2a6c-f6b26b
        background: '#F7F8FC', // was dark; now light base canvas
        'card-surface': '#FFFFFF', // elevated surface (new, derived from light theme intent)
        'text-primary': '#273043', // deep slate foreground
        'text-secondary': '#5C6784', // softened slate (manually chosen for contrast ~4.6:1 on #F7F8FC)
        primary: '#D33F49', // crimson primary
        'primary-light': '#E25C62', // lighter tint for hovers / subtle backgrounds
        'primary-dark': '#B32F3A', // darker shade for active states
        'accent-amber': '#F6B26B', // warm accent / warning highlight
        'success-green': '#23A094', // updated to align with lighter palette (previous emerald felt saturated on light bg)
        'error-red': '#E4572E', // cohesive error aligning with warm spectrum
        'neutral-grey': '#A9B2C3', // neutral utility (borders, placeholders)
        // Additional semantic accent endpoints replacing ad-hoc hex usage in static pages
        'info-blue': '#3B82F6', // replaces #3b82f6 usage
        'warm-orange': '#FB923C', // replaces #fb923c usage
        // Supplemental semantic layer tokens for consistent component styling
        'surface-muted': '#EEF1FA', // subtle alternate background / section separators
        'border-soft': '#D8DEE9', // light border on white surfaces (maintains ~2.2:1 on #FFFFFF)
        'focus-ring': '#1A2A6C', // unified focus outline color (AA on light bg at 2px)
        'warning-amber': '#F6B26B', // alias for accent-amber when semantic naming preferred
      },
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        serif: ['Inter', ...defaultTheme.fontFamily.serif],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #D33F49 0%, #B72D3B 100%)',
        'gradient-accent': 'linear-gradient(135deg, #1A2A6C 0%, #273B88 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F6B26B 0%, #FDD39A 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        card: '0 20px 48px -28px rgba(39,48,67,0.28)',
        'card-hover': '0 32px 60px -30px rgba(39,48,67,0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
