/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aura-lightpink': '#F5B5C1',
        'aura-beige': '#F5E6D3',
        'aura-neutral': '#6B4E3D',
        'aura-softgray': '#F8F8F8',
        'aura-chart-text': '#4A4A4A',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
