// vite.config.ts — servicos-global/organizacao/pedido/client
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
      // Aliases específicos ANTES dos prefixos genéricos (@tenant, etc.)
      { find: '@organizacao/historico', replacement: path.resolve(monorepoRoot, 'servicos-global/organizacao/historico-global/src/index.ts') },
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
      '/api/v1/ncm': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Notificacoes + users — proxy para configurador que valida JWT e repassa ao tenant-server
      '/api/tenant/notificacoes': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/api/v1/usuarios': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
      '/historico-api': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/historico-api/, ''),
      },
    },
  },
})
