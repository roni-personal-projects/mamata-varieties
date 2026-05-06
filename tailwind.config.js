/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E8E4DD", // Paper
        accent: "#38B6E8",  // Celestial Blue
        background: "#F5F3EE", // Off-white
        dark: "#111111",     // Black
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        drama: ["'DM Serif Display'", "serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      borderRadius: {
        '2xl': '2rem',
        '3xl': '3rem',
      }
    },
  },
  plugins: [],
}

