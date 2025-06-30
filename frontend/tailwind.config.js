/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        press: ['"Press Start 2P"', "cursive"],
        vt323: ["VT323", "monospace"],
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [],
};
