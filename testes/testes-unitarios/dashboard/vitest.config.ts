import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@nucleo': resolve(__dirname, '../../../nucleo-global'),
      '@tenant': resolve(__dirname, '../../../servicos-global/tenant'),
    },
  },
})
