/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: `#1F2B6C`,
        secondary: `#159EEC`,
        accent: `#9BDBFF`,
        black: `#212124`,
      },
      fontFamily: {
        worksans: ["Work Sans", "sans-serif"],
        yeseva: ["Yeseva One", "serif"],
      },
    },
  },
  plugins: [],
};
