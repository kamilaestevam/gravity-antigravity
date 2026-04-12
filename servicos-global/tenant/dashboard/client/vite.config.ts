import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases } from '../../../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      '@tenant/dashboard': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5010,
    proxy: {
      '/api/v1/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
