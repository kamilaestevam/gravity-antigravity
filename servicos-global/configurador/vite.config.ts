import { createRequire } from 'node:module'
import { createReadStream, existsSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../..')
const nodeModules = path.resolve(monorepoRoot, 'node_modules')

/** Agentes: VITE_DEV_* só com GRAVITY_AGENTE_WORKTREE=1 (PM2 master ignora env vazado). */
const isAgenteDev = process.env.GRAVITY_AGENTE_WORKTREE === '1'
const devUiPort = isAgenteDev ? Number(process.env.VITE_DEV_UI_PORT) || 8000 : 8000
const devApiPort = isAgenteDev ? Number(process.env.VITE_DEV_CFG_API_PORT) || 8005 : 8005
const devApiTarget = `http://127.0.0.1:${devApiPort}`

/** Compat: bundles antigos chamavam /api/v1/bid-frete/* sem prefixo -internacional. */
function reescreverProxyApiBidFreteLegado(path: string): string {
  if (path.startsWith('/api/v1/bid-frete-internacional')) return path
  let destino = path.replace(/^\/api\/v1\/bid-frete/, '/api/v1/bid-frete-internacional')
  destino = destino.replace(
    '/bid-frete-internacional/insights-alertas',
    '/bid-frete-internacional/dashboard/insights-alertas',
  )
  destino = destino.replace(
    '/bid-frete-internacional/mapa-cotacoes',
    '/bid-frete-internacional/dashboard/mapa-cotacoes',
  )
  return destino
}

const proxyHeadersBidFrete = (proxy: { on: (event: string, handler: (proxyReq: import('http').ClientRequest) => void) => void }) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.setHeader('x-internal-key', 'gravity-dev-internal-key-2026')
    proxyReq.setHeader('x-chave-interna-servico', 'gravity-dev-internal-key-2026')
  })
}

/** Resolve pelo mesmo node_modules que o npm usa (worktree pode hoistar para o repo pai). */
const requireFromCfg = createRequire(path.join(__dirname, 'package.json'))

function pkgDir(nomePacote: string): string {
  return path.dirname(requireFromCfg.resolve(`${nomePacote}/package.json`))
}

/** Uma única instância de React + TanStack Query (evita useEffect/workflow em null no Pedido lazy). */
const reactAliases = {
  react: pkgDir('react'),
  'react-dom': pkgDir('react-dom'),
  'react-dom/client': path.join(pkgDir('react-dom'), 'client'),
  'react/jsx-runtime': path.join(pkgDir('react'), 'jsx-runtime'),
  'react/jsx-dev-runtime': path.join(pkgDir('react'), 'jsx-dev-runtime'),
} as const

const tanstackAliases = {
  '@tanstack/react-query': pkgDir('@tanstack/react-query'),
  '@tanstack/query-core': pkgDir('@tanstack/query-core'),
} as const

/** Dev: serve PNGs de resultado-teste sem depender do cfg-back (fallback da UI EMT). */
function pluginEmtArtifactsDev(): Plugin {
  return {
    name: 'gravity-emt-artifacts-dev',
    configureServer(server) {
      server.middlewares.use('/dev-emt-artifacts', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        const raw = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
        const rel = raw.replace(/\\/g, '/')
        if (
          !rel.startsWith('testes/testes-em-tela/')
          || !rel.includes('/resultado-teste/')
          || !rel.endsWith('.png')
          || rel.includes('..')
        ) {
          res.statusCode = 403
          res.end('Forbidden')
          return
        }
        const abs = path.resolve(monorepoRoot, rel)
        if (!abs.startsWith(path.resolve(monorepoRoot))) {
          res.statusCode = 403
          res.end('Forbidden')
          return
        }
        if (!existsSync(abs)) {
          res.statusCode = 404
          res.end('Not found')
          return
        }
        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Cache-Control', 'private, max-age=300')
        if (req.method === 'HEAD') {
          res.statusCode = 200
          res.end()
          return
        }
        createReadStream(abs).pipe(res)
      })
    },
  }
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
  // Em build: root = monorepo inteiro para que Rollup resolva .ts fora do configurador
  // (Linux/Railway é case-sensitive e Rollup não aplica resolve.extensions fora do root)
  // Em dev: root = configurador (index.html local, proxy, HMR funcionam normalmente)
  root: isBuild ? monorepoRoot : __dirname,
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react(), ...(isBuild ? [] : [pluginEmtArtifactsDev()])],
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale que sobreviveram a refactors antigos em nucleo-global.
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/query-core',
      '@phosphor-icons/react',
      '@clerk/clerk-react',
      'react-router-dom',
      'zustand',
      'i18next',
      'react-i18next',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'react-grid-layout',
      'react-resizable',
    ],
    alias: {
      ...reactAliases,
      ...tanstackAliases,
      // Aliases específicos de tenant devem vir ANTES do base '@tenant' de createServiceAliases
      // (Vite usa o primeiro match — mais específico deve ter precedência)
      // historico-global: nome de pasta difere do alias usado pelo produto
      '@plataforma/historico': path.resolve(monorepoRoot, 'servicos-global/servicos-plataforma/historico-global/src/index.ts'),
      ...createNucleoAliases(monorepoRoot),
      // SSOT tabela-virtual-global — sobrescreve scan/HMR stale (nunca tabelas-componentes/)
      '@nucleo/tabela-virtual-global': path.resolve(
        monorepoRoot,
        'nucleo-global/Tabelas/tabela-virtual-global/src',
      ),
      // Pacote novo — alias explícito garante resolve mesmo com cache/HMR stale
      '@nucleo/campo-dado-global': path.resolve(
        monorepoRoot,
        'nucleo-global/Campos/campo-dado-global/src/index.ts',
      ),
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
      // Lógica pura Admin/Testes — testes/infra/admin/ (sem React)
      '@testes/infra': path.resolve(monorepoRoot, 'testes/infra'),
    },
  },
  optimizeDeps: {
    include: [
      '@babel/core',
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'react-i18next', 'i18next', 'zustand', '@clerk/clerk-react',
      '@tanstack/react-query',
      '@tanstack/query-core',
      // exceljs: Node.js-heavy — pré-bundle garante que o polyfill process.env seja aplicado
      'exceljs',
      // @tanstack/react-virtual: CJS com exports condicionais — pré-bundle evita problemas de interop
      '@tanstack/react-virtual',
      // NOTA: @dnd-kit/* NÃO entra aqui — já tem alias explícito em resolve.alias.
      // Colocar em optimizeDeps.include E ter alias cria dual-instance: Vite serve
      // a versão pré-bundled (.vite/deps/) E a aliasada (raw source) → DndContext e
      // useSortable ficam em instâncias separadas → drag-and-drop quebra.
    ],
    exclude: [
      '@nucleo/localizador-global',
      '@nucleo/tabela-virtual-global',
      // Só via resolve.alias — pré-bundle em .vite/deps gera 504 e quebra lazy-load da lista.
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
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
    port: devUiPort,
    strictPort: true,
    // Permite http://127.0.0.1:8000 (Windows: localhost ≠ 127.0.0.1 quando só [::1] escuta)
    host: true,
    warmup: {
      clientFiles: [
        path.resolve(__dirname, 'src/main.tsx'),
        path.resolve(__dirname, 'src/App.tsx'),
        path.resolve(monorepoRoot, 'servicos-global/produto/pedido/client/src/App.tsx'),
        path.resolve(monorepoRoot, 'servicos-global/produto/pedido/client/src/pages/PedidosVisaoGeral.tsx'),
        path.resolve(monorepoRoot, 'servicos-global/produto/pedido/client/src/pages/Pedidos.tsx'),
        path.resolve(
          monorepoRoot,
          'servicos-global/produto/bid-frete-internacional/client/src/pages/lista-bid-frete-internacional.tsx',
        ),
        path.resolve(
          monorepoRoot,
          'servicos-global/produto/bid-frete-internacional/client/src/components/BidFreteListaPainelBar.tsx',
        ),
      ],
    },
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
        configure: proxyHeadersBidFrete,
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      '/api/v1/bid-frete': {
        target: 'http://localhost:8023',
        changeOrigin: true,
        rewrite: reescreverProxyApiBidFreteLegado,
        configure: proxyHeadersBidFrete,
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
      // Smart Read — BFF/adapter para o Smart Read legado. Porta 8033.
      '/api/v1/smart-read': {
        target: 'http://localhost:8033',
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
      // /api/v1/fornecedores — cartório Cadastros (porta 8031).
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
      '/api/v1/fornecedores': {
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
        target: devApiTarget,
        changeOrigin: true,
        onError(err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // Health checks para monitoramento de servidores em dev (useServerHealth)
      // Cada rota reescreve para /health no backend correspondente.
      // Devem vir APÓS o fallback /api para não interferir com rotas de produto.
      '/dev-health/configurador': {
        target: devApiTarget,
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
      '/dev-health/smart-read': {
        target: 'http://localhost:8033',
        changeOrigin: true,
        rewrite: () => '/health',
        onError(_err, _req, res) {
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
    },
  },
}
})
