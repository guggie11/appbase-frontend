import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  build: {
    rollupOptions: {
      // framer-motion 12.x has a known issue with Rolldown/Vite 8
      // treat it as external to avoid missing-export build errors,
      // but only if you want to exclude it. Here we workaround via
      // onwarn silence — the actual import is already removed.
    },
  },
  optimizeDeps: {
    include: ['framer-motion'],
  },
})
