// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Memindai file HTML utama
    "./src/**/*.{js,ts,jsx,tsx}", // Memindai semua file JS di dalam folder src
    "./main.js" // Memindai file main.js
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
