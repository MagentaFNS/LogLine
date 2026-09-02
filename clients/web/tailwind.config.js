/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        logline: {
          dark: '#111111',
          light: '#f4f4f4',
          accent: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
