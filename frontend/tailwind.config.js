/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'dark', // <-- THIS IS THE MAGIC LINE
  theme: {
    extend: {},
  },
  plugins: [],
}