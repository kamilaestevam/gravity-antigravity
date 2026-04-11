// vite.config.ts — produto/processo/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases } from '../../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../..')

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', 'react-router-dom'],
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
    },
  },

  optimizeDeps: {
    include: [
      'react-i18next',
      'i18next',
      '@phosphor-icons/react',
    ],
  },

  server: {
    port: 5000,
    fs: {
      allow: [monorepoRoot],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8025',
        changeOrigin: true,
      },
    },
  },
})
