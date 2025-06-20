/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        'video': '16 / 9',
      },
      colors: {
        youtube: {
          red: '#FF0000',
          dark: '#0F0F0F',
          gray: '#F9F9F9',
        }
      },
      fontFamily: {
        'youtube': ['Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}