/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ukm: { red: '#8B0000', dark: '#050505' },
        gold: { 400: '#fbbf24', 500: '#d4af37', 600: '#b4941f' }
      },
      fontFamily: {
         serif: ['"Playfair Display"', 'serif'],
         sans: ['"Poppins"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}