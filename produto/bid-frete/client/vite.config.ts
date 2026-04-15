// vite.config.ts — produto/bid-frete/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../..')

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['gabi']),
    },
  },

  optimizeDeps: {
    include: [
      'zustand',
      'zustand/middleware',
      'react-i18next',
      'i18next',
      '@phosphor-icons/react',
      '@clerk/clerk-react',
    ],
  },

  server: {
    port: 5181,
    fs: {
      allow: [monorepoRoot],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8023',
        changeOrigin: true,
      },
    },
  },
})
