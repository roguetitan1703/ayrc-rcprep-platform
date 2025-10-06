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
        // === FINAL Color Palette (Crimson Trust) ===
        // Reference: https://coolors.co/f7f8fc-273043-d33f49-1a2a6c-f6b26b
        // #F7F8FC - Background (light canvas)
        // #273043 - Text Primary (dark slate for headings/emphasis)
        // #D33F49 - Primary (crimson - main CTAs and key actions)
        // #1A2A6C - Secondary/Focus Ring (navy blue for focus states)
        // #F6B26B - Accent (amber - USE SPARINGLY for warnings/highlights only)

        // Base Colors
        background: '#F7F8FC',
        'card-surface': '#FFFFFF',
        'surface-muted': '#EEF1FA',

        // Text Colors
        'text-primary': '#273043',
        'text-secondary': '#5C6784',

        // Primary Brand Color (Crimson) - with variants
        primary: '#D33F49', // Base crimson
        'primary-light': '#E25C62', // Hover for light backgrounds
        'primary-dark': '#B32F3A', // Active/pressed state, dark buttons
        'primary-hover': '#E25C62', // Explicit hover state (same as light)

        // Secondary Color (Navy Blue) - with variants
        'focus-ring': '#1A2A6C', // Base navy for focus outlines
        secondary: '#1A2A6C', // Alias for semantic usage
        'secondary-light': '#2d4087', // Hover state for navy
        'secondary-dark': '#0f1a3a', // Active state for navy
        'info-blue': '#3B82F6', // Analytics and informational content

        // Accent Color (Amber) - with variants, USE SPARINGLY
        'accent-amber': '#F6B26B', // Base amber
        'accent-amber-light': '#f9c589', // Hover for amber elements
        'accent-amber-dark': '#d99a52', // Active state for amber

        // Status Colors - with variants
        'success-green': '#23A094',
        'success-green-light': '#2db8aa', // Hover
        'success-green-dark': '#1d8077', // Active
        'error-red': '#E4572E',
        'error-red-light': '#e8724f', // Hover
        'error-red-dark': '#c54824', // Active

        // Utility Colors
        'neutral-grey': '#A9B2C3',
        'border-soft': '#D8DEE9',
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
