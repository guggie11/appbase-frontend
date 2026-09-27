import { defineConfig } from 'orval'

export default defineConfig({
  appbase: {
    input: {
      target: '../appbase-infrastructure/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated/index.ts',
      schemas: './src/shared/api/generated/model',
      client: 'react-query',
      baseUrl: import.meta?.url ? undefined : 'http://localhost:8000',
      override: {
        mutator: {
          path: './src/shared/api/client.ts',
          name: 'apiClient',
        },
      },
    },
  },
})
