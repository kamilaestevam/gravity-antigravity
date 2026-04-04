import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    env: {
      NODE_ENV: 'test',
      INTERNAL_SERVICE_KEY: 'test-internal-key',
      PORT: '8010',
    },
  },
  resolve: {
    alias: {
      '@nucleo': resolve(__dirname, '../../../nucleo-global'),
      '@tenant': resolve(__dirname, '../../../servicos-global/tenant'),
      '@produto': resolve(__dirname, '../../../produto'),
    },
  },
})
