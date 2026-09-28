/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0A192F',
          primary: '#0F3460',
          secondary: '#16213E',
          accent: '#FF7722',
          emerald: '#059669',
          light: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B'
        }
      }
    },
  },
  plugins: [],
};
