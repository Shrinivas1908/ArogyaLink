import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// ArogyaSetu Unified Doctor-Patient Portal — Vite Config (Port 5175)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    postcss: {},
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
