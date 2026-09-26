/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    colors: {
      /* gray */
      'gray-25': '#fcfcfd',
      'gray-50': '#f9fafb',
      'gray-100': '#f2f4f7',
      'gray-200': '#eaecf0',
      'gray-300': '#d0d5dd',
      'gray-400': '#98a2b3',
      'gray-500': '#667085',
      'gray-600': '#475467',
      'gray-700': '#344054',
      'gray-800': '#1d2939',
      'gray-900': '#101828',

      /* primary color */
      'primary-25': '#fcfaff',
      'primary-50': '#f9f5ff',
      'primary-100': '#f4ebff',
      'primary-200': '#e9d7fe',
      'primary-300': '#d6bbfb',
      'primary-400': '#b692f6',
      'primary-500': '#9e77ed',
      'primary-600': '#7f56d9',
      'primary-700': '#6941c6',
      'primary-800': '#53389e',
      'primary-900': '#42307d',

      /* secondary colors */
      'secondary-blue-500': '#2e90fa',
      'secondary-indigo-500': '#6172f3',
      'secondary-purple-500': '#7a5af8',
      'secondary-pink-500': '#ee46bc',
      'secondary-rose-500': '#f63d68',
      'secondary-orange-500': '#fb6514',

      /* error color */
      'error-25': '#fffbfa',
      'error-50': '#fef3f2',
      'error-100': '#fee4e2',
      'error-200': '#fecdca',
      'error-300': '#fda29b',
      'error-400': '#f97066',
      'error-500': '#f04438',
      'error-600': '#d92d20',
      'error-700': '#b42318',
      'error-800': '#912018',
      'error-900': '#7a271a',

      /* warning color */

      'warning-25': '#fffcf5',
      'warning-50': '#fffaeb',
      'warning-100': '#fef0c7',
      'warning-200': '#fedf89',
      'warning-300': '#fec84b',
      'warning-400': '#fdb022',
      'warning-500': '#f79009',
      'warning-600': '#dc6803',
      'warning-700': '#b54708',
      'warning-800': '#93370d',
      'warning-900': '#7a2e0e',

      /* success color */
      'success-25': '#f6fef9',
      'success-50': '#ecfdf3',
      'success-100': '#d1fadf',
      'success-200': '#a6f4c5',
      'success-300': '#6ce9a6',
      'success-400': '#32d583',
      'success-500': '#12b76a',
      'success-600': '#039855',
      'success-700': '#027a48',
      'success-800': '#05603a',
      'success-900': '#054f31',

      black: '#1b1b1b',
      white: '#fff',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      boxShadow: {
        /* shadow */
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        '3xl': 'var(--shadow-3xl)',

        /* shadow of btn */
        primary: 'var(--shadow-primary)',
        gray: 'var(--shadow-gray)',
        destructive: 'var(--shadow-destructive)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        dashboard: 'var(--radius-dashboard)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
