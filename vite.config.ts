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
      // It is not imported directly — kept as a dependency for future use.
    },
  },
  optimizeDeps: {
    // Exclude framer-motion from pre-bundling to avoid Rolldown compat errors
    exclude: ['framer-motion'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
