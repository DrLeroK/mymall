import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'oklch(96% 0.02 223.128)',
          100: 'oklch(92% 0.04 223.128)',
          200: 'oklch(84% 0.06 223.128)',
          300: 'oklch(74% 0.08 223.128)',
          400: 'oklch(63% 0.095 223.128)',
          500: 'oklch(52% 0.105 223.128)', // Primary brand color
          600: 'oklch(45% 0.100 223.128)',
          700: 'oklch(38% 0.090 223.128)',
          800: 'oklch(30% 0.075 223.128)',
          900: 'oklch(22% 0.060 223.128)',
          950: 'oklch(15% 0.045 223.128)',
          DEFAULT: 'oklch(52% 0.105 223.128)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
