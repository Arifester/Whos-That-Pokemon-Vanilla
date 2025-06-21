// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite' // Impor plugin

export default defineConfig({
  plugins: [
    tailwindcss(), // Tambahkan plugin ke dalam array plugins
  ],
})
