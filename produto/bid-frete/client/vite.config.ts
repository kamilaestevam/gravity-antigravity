// vite.config.ts — produto/bid-frete/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../..')

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      // ── Nucleo Global ──
      '@nucleo/cabecalho-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/cabecalho-global/src/index.ts'),
      '@nucleo/pagina-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/pagina-global/src/index.ts'),
      '@nucleo/card-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/card-global/src/index.ts'),
      '@nucleo/logo-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/logo-global/src/index.ts'),
      '@nucleo/usuario-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/usuario-global/src/index.ts'),
      '@nucleo/menu-lateral-global': path.resolve(monorepoRoot, 'nucleo-global/Layout/menu-lateral-global/src/index.ts'),
      '@nucleo/tooltip-global': path.resolve(monorepoRoot, 'nucleo-global/Feedback/tooltip-global/src/index.ts'),
      '@nucleo/status-badge-global': path.resolve(monorepoRoot, 'nucleo-global/Feedback/status-badge-global/src/index.ts'),
      '@nucleo/botao-global': path.resolve(monorepoRoot, 'nucleo-global/Botoes/botao-global/src/index.ts'),
      '@nucleo/botoes-salvar-global': path.resolve(monorepoRoot, 'nucleo-global/Botoes/botoes-salvar-global/src/index.ts'),
      '@nucleo/tabela-global': path.resolve(monorepoRoot, 'nucleo-global/Tabelas/tabela-global/src/index.ts'),
      '@nucleo/campo-localizar-expandido-global': path.resolve(monorepoRoot, 'nucleo-global/Campos/campo-localizar-expandido-global/src/index.ts'),
      '@nucleo/campo-calendario-global': path.resolve(monorepoRoot, 'nucleo-global/Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global': path.resolve(monorepoRoot, 'nucleo-global/Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-select-global': path.resolve(monorepoRoot, 'nucleo-global/Campos/campo-select-global/src/index.ts'),
      '@nucleo/modal-global': path.resolve(monorepoRoot, 'nucleo-global/Modais/modal-global/src/index.ts'),
      '@nucleo/modal-confirmar-excluir-global': path.resolve(monorepoRoot, 'nucleo-global/Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-formulario-global': path.resolve(monorepoRoot, 'nucleo-global/Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/utils': path.resolve(monorepoRoot, 'nucleo-global/Utilidades/utils/src/index.ts'),
      '@nucleo/mensageria-global': path.resolve(monorepoRoot, 'nucleo-global/Mensageria Global/mensageria-global/src/index.ts'),
      // ── Shell / Tenant ──
      '@gravity/shell': path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
      '@shell': path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
      '@tenant/gabi': path.resolve(monorepoRoot, 'servicos-global/tenant/gabi'),
      '@tenant': path.resolve(monorepoRoot, 'servicos-global/tenant'),
      '@produto': path.resolve(monorepoRoot, 'servicos-global/produto'),
    },
  },

  optimizeDeps: {
    include: [
      'zustand',
      'zustand/middleware',
      'react-i18next',
      'i18next',
      '@phosphor-icons/react',
      '@clerk/clerk-react',
    ],
  },

  server: {
    port: 5181,
    fs: {
      allow: [monorepoRoot],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8023',
        changeOrigin: true,
      },
    },
  },
})
