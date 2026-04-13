// vite.config.ts — produto/pedido/client
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
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'react-grid-layout', 'react-resizable'],
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['historico', 'gabi']),
      // Alias específico para historico (nome da pasta difere)
      '@tenant/historico': path.resolve(monorepoRoot, 'servicos-global/tenant/historico-global/src/index.ts'),
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
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
      '/historico-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/historico-api/, ''),
      },
    },
  },
})
