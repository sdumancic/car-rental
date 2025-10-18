/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0b95da',
        'background-light': '#f5f7f8',
        'background-dark': '#101c22',
      }
    },
  },
  plugins: [],
}
