// vite.config.ts — servicos-global/produto/pedido/client
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../../..')
const nodeModules = path.resolve(monorepoRoot, 'node_modules')

const requireFromRoot = createRequire(path.join(monorepoRoot, 'package.json'))

function pkgDir(nomePacote: string): string {
  return path.dirname(requireFromRoot.resolve(`${nomePacote}/package.json`))
}

/** Uma única instância de React + TanStack Query (evita useEffect/workflow em null). */
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

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/query-core',
      '@phosphor-icons/react',
      '@clerk/clerk-react',
      'react-router-dom',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'react-grid-layout',
      'react-resizable',
    ],
    alias: {
      ...reactAliases,
      ...tanstackAliases,
      '@dnd-kit/core': path.resolve(nodeModules, '@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(nodeModules, '@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(nodeModules, '@dnd-kit/utilities'),
      // Alias @plataforma/historico removido em 2026-05-07 — Pedido client nao consome
      // mais o componente <Historico /> compartilhado (tela centralizada no Configurador).
      ...Object.fromEntries(
        Object.entries({
          ...createNucleoAliases(monorepoRoot),
          ...createServiceAliases(monorepoRoot),
          ...createTenantAliases(monorepoRoot, ['gabi']),
        }),
      ),
      '@nucleo/tabela-virtual-global': path.resolve(
        monorepoRoot,
        'nucleo-global/Tabelas/tabela-virtual-global/src',
      ),
    },
  },

  define: {
    'process.env': {},
  },

  optimizeDeps: {
    include: [
      'zustand',
      'zustand/middleware',
      'react-i18next',
      'i18next',
      '@phosphor-icons/react',
      '@clerk/clerk-react',
      '@tanstack/react-query',
      '@tanstack/query-core',
      '@tanstack/react-virtual',
      'exceljs',
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-grid-layout',
      'react-resizable',
      // @dnd-kit: só via resolve.alias — não pré-bundle (dual-instance quebra hooks)
    ],
  },

  server: {
    port: 5179,
    fs: {
      allow: [monorepoRoot],
    },
    proxy: {
      // /api/v1/ncm/* → Cadastros (porta 8031).
      // Rewrite /api/v1/ncm → /api/v1/cadastros/ncm (path real no backend).
      // Rotas públicas (buscar, validar) NÃO precisam de x-internal-key.
      '/api/v1/ncm': {
        target: 'http://localhost:8031',
        changeOrigin: true,
        rewrite: (path: string) => path.replace('/api/v1/ncm', '/api/v1/cadastros/ncm'),
      },
      // /api/v1/me — proxy para configurador (SSOT de identidade)
      '/api/v1/me': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      // Workspaces da Lista — mesmo endpoint do Hub (Configurador 8005)
      '/api/v1/hub': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      // Notificacoes + users — proxy para configurador que valida JWT e repassa ao super-servidor da plataforma
      '/api/v1/notificacoes': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/api/v1/usuarios': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/api/v1/cadastros': {
        target: 'http://localhost:8031',
        changeOrigin: true,
      },
      // Parceiros COMEX — Cadastros (8031). Sem este proxy, /fornecedores cai no catch-all → Pedido 8030 (404).
      '/api/v1/fornecedores': {
        target: 'http://localhost:8031',
        changeOrigin: true,
      },
      '/api/v1/empresas': {
        target: 'http://localhost:8031',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
      // /historico-api removido em 2026-05-07 — produto Pedido nao consulta mais o
      // backend de historico-global. Tela "Historico" virou hyperlink externo para
      // /admin/historico-global no Configurador (SSOT da UI de auditoria).
    },
  },
})
