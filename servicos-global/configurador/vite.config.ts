import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill para pacotes Node.js (exceljs, jspdf) rodando no browser
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale que sobreviveram a refactors antigos em nucleo-global.
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'zustand', 'i18next', 'react-i18next', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'react-grid-layout', 'react-resizable'],
    alias: {
      // Aliases específicos de tenant devem vir ANTES do base '@tenant' de createServiceAliases
      // (Vite usa o primeiro match — mais específico deve ter precedência)
      // historico-global: nome de pasta difere do alias usado pelo produto
      '@tenant/historico': path.resolve(monorepoRoot, 'servicos-global/tenant/historico-global/src/index.ts'),
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['gabi', 'dashboard', 'atividades', 'cadastros']),
      // peerDeps do kanban-global — npm workspaces hoista para o root
      '@dnd-kit/core': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(monorepoRoot, 'node_modules/@dnd-kit/utilities'),
      // Aliases dos Produtos (para lazy-load dentro do Configurador)
      '@produto': path.resolve(monorepoRoot, 'produto'),
    },
  },
  optimizeDeps: {
    include: [
      'react-i18next', 'i18next', 'zustand', '@clerk/clerk-react',
      // exceljs: Node.js-heavy — pré-bundle garante que o polyfill process.env seja aplicado
      'exceljs',
      // @tanstack/react-virtual: CJS com exports condicionais — pré-bundle evita problemas de interop
      '@tanstack/react-virtual',
      // NOTA: @dnd-kit/* NÃO entra aqui — já tem alias explícito em resolve.alias.
      // Colocar em optimizeDeps.include E ter alias cria dual-instance: Vite serve
      // a versão pré-bundled (.vite/deps/) E a aliasada (raw source) → DndContext e
      // useSortable ficam em instâncias separadas → drag-and-drop quebra.
    ],
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
      // Cadastros (Fase 5 DDD) — serviço tenant com CRUD de Empresa, Moeda,
      // Unidade, NCM. Porta 8031 (8030 é do Pedido). Todas as chamadas levam
      // x-internal-key; o id_organizacao é injetado pelo frontend via header
      // x-organizacao-id (não pelo proxy — vem do currentUser do ShellStore).
      '/api/v1/cadastros': {
        target: 'http://localhost:8031',
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
      // historico-global — serviço tenant em porta dedicada
      // Mesma estrutura do proxy 5179: rewrite remove o prefixo antes de repassar ao backend
      '/historico-api': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/historico-api/, ''),
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
