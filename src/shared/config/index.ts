// Environment variable configuration
// All vars must be prefixed with VITE_ to be exposed to the client.

export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
} as const
