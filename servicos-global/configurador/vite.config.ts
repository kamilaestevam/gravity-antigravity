import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../..')
const nodeModules = path.resolve(monorepoRoot, 'node_modules')

/** Força uma única instância física de React no bundle dev (evita Invalid hook call no ClerkProvider). */
const reactAliases = {
  react: path.resolve(nodeModules, 'react'),
  'react-dom': path.resolve(nodeModules, 'react-dom'),
  'react-dom/client': path.resolve(nodeModules, 'react-dom/client'),
  'react/jsx-runtime': path.resolve(nodeModules, 'react/jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(nodeModules, 'react/jsx-dev-runtime'),
} as const

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
  // Em build: root = monorepo inteiro para que Rollup resolva .ts fora do configurador
  // (Linux/Railway é case-sensitive e Rollup não aplica resolve.extensions fora do root)
  // Em dev: root = configurador (index.html local, proxy, HMR funcionam normalmente)
  root: isBuild ? monorepoRoot : __dirname,
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale que sobreviveram a refactors antigos em nucleo-global.
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'zustand', 'i18next', 'react-i18next', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'react-grid-layout', 'react-resizable'],
    alias: {
      ...reactAliases,
      // Aliases específicos de tenant devem vir ANTES do base '@tenant' de createServiceAliases
      // (Vite usa o primeiro match — mais específico deve ter precedência)
      // historico-global: nome de pasta difere do alias usado pelo produto
      '@plataforma/historico': path.resolve(monorepoRoot, 'servicos-global/servicos-plataforma/historico-global/src/index.ts'),
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['gabi', 'dashboard', 'atividades', 'cadastros']),
      // peerDeps do kanban-global — npm workspaces hoista para o root
      '@dnd-kit/core': path.resolve(nodeModules, '@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(nodeModules, '@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(nodeModules, '@dnd-kit/utilities'),
      // Aliases dos Produtos (para lazy-load dentro do Configurador)
      '@produto': path.resolve(monorepoRoot, 'servicos-global/produto'),
      // Cadastros — domínio próprio fora de servicos-plataforma
      '@cadastros': path.resolve(monorepoRoot, 'servicos-global/cadastros'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
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
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
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
      allow: [monorepoRoot],
    },
    proxy: {
      '/api/v1/gabi': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
            if (!req.headers['x-id-organizacao']) {
              proxyReq.setHeader('x-id-organizacao', 'org_dev_default')
              proxyReq.setHeader('x-id-usuario', 'user_dev_default')
              proxyReq.setHeader('x-tipo-usuario', 'SUPER_ADMIN')
            }
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // Produtos — cada um aponta para seu backend próprio
      // DEV: cada produto tem sua própria CHAVE_INTERNA_SERVICO no backend.
      // O proxy reescreve x-internal-key em tempo de request para o valor que
      // o backend daquele produto espera, evitando mismatch com a VITE_CHAVE_INTERNA_SERVICO
      // do configurador (que é outra chave, usada pelo backend do próprio configurador).
      '/api/v1/bid-frete-internacional': {
        target: 'http://localhost:8023',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
            if (!req.headers['x-id-organizacao'] || req.headers['x-id-organizacao'] === '') {
              proxyReq.setHeader('x-id-organizacao', 'org_dev_default')
            }
            if (!req.headers['x-id-usuario'] || req.headers['x-id-usuario'] === '') {
              proxyReq.setHeader('x-id-usuario', 'user_dev_default')
            }
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api/v1/pedidos': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api/v1/pedidos/analytics': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
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
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // /api/v1/empresas — também servido pelo Cadastros (mesmo backend, porta 8031).
      // Histórico DDD: o router de Empresa foi montado em /api/v1/empresas (raiz)
      // em vez de /api/v1/cadastros/empresas (ver cadastros/server/src/index.ts:41).
      // Sem este proxy, a chamada cai no fallback `/api` → :8005 (configurador) → 404.
      '/api/v1/empresas': {
        target: 'http://localhost:8031',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // historico-global — serviço tenant em porta dedicada
      // Mesma estrutura do proxy 5179: rewrite remove o prefixo antes de repassar ao backend
      '/historico-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/historico-api/, ''),
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // /api/v1/ncm/* → Cadastros (porta 8031).
      // Rewrite /api/v1/ncm → /api/v1/cadastros/ncm (path real no backend).
      // Rotas públicas (buscar, validar) NÃO precisam de x-internal-key.
      '/api/v1/ncm': {
        target: 'http://localhost:8031',
        changeOrigin: true,
        rewrite: (path: string) => path.replace('/api/v1/ncm', '/api/v1/cadastros/ncm'),
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
      // Health checks para monitoramento de servidores em dev (useServerHealth)
      // Cada rota reescreve para /health no backend correspondente.
      // Devem vir APÓS o fallback /api para não interferir com rotas de produto.
      '/dev-health/configurador': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        rewrite: () => '/health',
        onError(_err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/dev-health/historico': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: () => '/health',
        onError(_err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/dev-health/pedido': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        rewrite: () => '/health',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(_err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/dev-health/cadastros': {
        target: 'http://localhost:8031',
        changeOrigin: true,
        rewrite: () => '/health',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
            proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
          })
        },
        onError(_err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
    },
  },
}
})
