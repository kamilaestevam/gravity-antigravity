import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'zustand', 'i18next', 'react-i18next', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['gabi', 'dashboard', 'atividades']),
      // peerDeps do kanban-global — forçar resolução a partir do configurador
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      // Aliases dos Produtos (para lazy-load dentro do Configurador)
      '@produto': path.resolve(monorepoRoot, 'produto'),
    },
  },
  optimizeDeps: {
    include: ['react-i18next', 'i18next', 'zustand', '@clerk/clerk-react'],
    exclude: ['@nucleo/localizador-global'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-clerk': ['@clerk/clerk-react'],
          'vendor-icons': ['@phosphor-icons/react'],
          'vendor-i18n': ['react-i18next', 'i18next'],
        },
      },
    },
  },
  server: {
    port: 8000,
    fs: {
      allow: ['../..'],
    },
    proxy: {
      '/api/v1/gabi': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
    },
  },
})
