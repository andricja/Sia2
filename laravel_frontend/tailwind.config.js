/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pharmacy Teal/Turquoise - Primary Brand Color
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#14b8a6',  // Main teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Medical Blue - Secondary Color
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Success/Health Green
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Pharmacy gradient colors
        teal: {
          light: '#5eead4',
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        },
        cyan: {
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-pharmacy': 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(174,100%,88%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,88%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(162,100%,88%,0.2) 0px, transparent 50%)',
        'gradient-card': 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(20, 184, 166, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(20, 184, 166, 0.15)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'teal': '0 10px 40px -10px rgba(20, 184, 166, 0.4)',
        'cyan': '0 10px 40px -10px rgba(6, 182, 212, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
