/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{tsx,ts,jsx,js}"],
  theme: {
    extend: {
      colors: {
         border: "transparent",
         success : "#0369a1",
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        secondary: {
          50: "#fdf4f9",
          100: "#fae8f3",
          200: "#fbd3f0",
          300: "#f8b4e2",
          400: "#f480c0",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9b216e",
          900: "#771b53",
        },
      },
    },
  },
  plugins: [],
};
