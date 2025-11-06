import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        baseball: {
          red: '#CC0000',
          green: '#228B22',
          yellow: '#FFD700',
          gray: '#4A4A4A',
          cream: '#F5F5DC',
        },
      },
      fontFamily: {
        display: ['Passion One', 'cursive'],
        body: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
