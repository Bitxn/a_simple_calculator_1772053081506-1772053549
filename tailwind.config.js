/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./src/runtime/**/*.{ts,tsx}",
    "./src/generated/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};
