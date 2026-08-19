/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './public/**/*.js'],
  // Toggled at runtime by app.js, so they never appear in the scanned markup.
  safelist: ['hidden', 'max-h-0', 'max-h-96', 'opacity-0', 'opacity-100'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        // Palette lifted from the Skill Tree K9 mark: deep night blue + constellation gold.
        night: {
          950: '#06101f', 900: '#0a1a33', 800: '#0f2549',
          700: '#153366', 600: '#1c4184', 500: '#1b4796',
        },
        gold: {
          200: '#faeac6', 300: '#f6d79a', 400: '#f0c164',
          500: '#e3a93f', 600: '#c68a2b', 700: '#9c6a1e',
        },
        parchment: { DEFAULT: '#f7f4ec', 100: '#fdfbf6', 200: '#efe9db' },
        // legacy alias so any stray `brand` utility still lands on-brand
        brand: { DEFAULT: '#e3a93f', dark: '#c68a2b' },
      },
    },
  },
  plugins: [],
}
