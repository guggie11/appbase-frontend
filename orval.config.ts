import { defineConfig } from 'orval'

export default defineConfig({
  appbase: {
    input: {
      target: '../appbase-backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/shared/api/generated/endpoints',
      schemas: 'src/shared/api/generated/models',
      client: 'react-query',
      baseUrl: '/api/v1',
      override: {
        mutator: {
          path: 'src/shared/api/client.ts',
          name: 'apiClientMutator',
        },
      },
    },
  },
})
