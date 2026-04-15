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
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom'],
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      '@tenant/historico': path.resolve(__dirname, '../src/index.ts'),
      // dnd-kit (resolvido a partir do node_modules local)
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      '@tanstack/react-virtual': path.resolve(__dirname, 'node_modules/@tanstack/react-virtual'),
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@tanstack/react-virtual',
      'react-i18next',
      'i18next',
    ],
  },
  server: {
    port: 5201,
    fs: { allow: [monorepoRoot] },
    proxy: {
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true,
      },
    },
  },
})
