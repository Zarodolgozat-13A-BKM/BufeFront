/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ee8c2b",
        "background-light": "#f8f7f6",
        "background-dark": "#221910",
      },
    },
  },
  plugins: [],
}
