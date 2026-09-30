import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// NOTE: @vitejs/plugin-react-oxc is deprecated as of v0.4.3 — its OXC transforms
// are now included directly in @vitejs/plugin-react (v6+). The migration from
// @vitejs/plugin-react to OXC-based transforms is complete via the standard plugin.
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
    rollupOptions: {},
  },
  server: {
    allowedHosts: ['canned-cosmic-snide.ngrok-free.dev', '100.126.234.0', 'all'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    alias: {
      'framer-motion': `${import.meta.dirname}/src/test/mocks/framer-motion.tsx`,
    },
    env: {
      VITE_API_URL: 'http://localhost:8000/api/v1',
    },
  },
})
