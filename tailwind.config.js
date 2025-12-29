/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "black",
      },
      borderRadius: {
        custom: "12px",
        big: "20px",
      },
    },
  },
  plugins: [],
};
