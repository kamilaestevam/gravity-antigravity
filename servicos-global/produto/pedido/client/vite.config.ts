// vite.config.ts — servicos-global/produto/pedido/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../../../nucleo-global/vite-aliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../../..')

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'react-grid-layout', 'react-resizable'],
    alias: [
      // Alias @plataforma/historico removido em 2026-05-07 — Pedido client nao consome
      // mais o componente <Historico /> compartilhado (tela centralizada no Configurador).
      ...Object.entries({ ...createNucleoAliases(monorepoRoot), ...createServiceAliases(monorepoRoot), ...createTenantAliases(monorepoRoot, ['gabi']) })
        .map(([find, replacement]) => ({ find, replacement })),
    ],
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
      '@tanstack/react-virtual',
      'exceljs',
      'react-grid-layout',
      'react-resizable',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
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
