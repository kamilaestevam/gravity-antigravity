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
      'lucide-react',
    ],
  },

  server: {
    port: 5002,
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
