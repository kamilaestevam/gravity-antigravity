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
      // peerDeps do kanban-global — npm workspaces hoista para o root
      '@dnd-kit/core': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/utilities'),
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
      // Produtos — cada um aponta para seu backend próprio
      // DEV: cada produto tem seu próprio INTERNAL_SERVICE_KEY no backend.
      // O proxy reescreve x-internal-key em tempo de request para o valor que
      // o backend daquele produto espera, evitando mismatch com a VITE_INTERNAL_SERVICE_KEY
      // do configurador (que é outra chave, usada pelo backend do próprio configurador).
      '/api/v1/pedidos': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api/v1/analytics/pedido': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api/v1/ncm': {
        target: 'http://localhost:3001',
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
