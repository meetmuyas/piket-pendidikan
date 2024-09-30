/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./detail.html",
    "./edit.html",
    "./add.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      maxWidth: {
        "screen-xs": "480px",
      },
      spacing: {
        "52px": "52px",
        "88px": "88px",
      },
    },
  },
  plugins: [],
};
