/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2ecc40', // svěží zelená
          dark: '#228c1d',
          light: '#a8e6a3',
        },
      },
    },
  },
  plugins: [],
};
