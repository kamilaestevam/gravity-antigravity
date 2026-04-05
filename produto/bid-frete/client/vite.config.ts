// vite.config.ts — produto/bid-frete/client
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../..')

const nucleo = (subpath: string) =>
  path.resolve(monorepoRoot, `nucleo-global/${subpath}`)

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      // ── Botoes ──
      '@nucleo/botao-global':                     nucleo('Botoes/botao-global/src/index.ts'),
      '@nucleo/botoes-salvar-global':              nucleo('Botoes/botoes-salvar-global/src/index.ts'),
      // ── Campos ──
      '@nucleo/campo-calendario-global':           nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global':                nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-localizar-expandido-global':  nucleo('Campos/campo-localizar-expandido-global/src/index.ts'),
      '@nucleo/campo-select-global':               nucleo('Campos/campo-select-global/src/index.ts'),
      '@nucleo/switch-global':                     nucleo('Campos/switch-global/src/index.ts'),
      // ── Feedback ──
      '@nucleo/mensageria-global':                 nucleo('Mensageria Global/mensageria-global/src/index.ts'),
      '@nucleo/status-badge-global':               nucleo('Feedback/status-badge-global/src/index.ts'),
      '@nucleo/status-salvar-global':              nucleo('Feedback/status-salvar-global/src/index.ts'),
      '@nucleo/tooltip-global':                    nucleo('Feedback/tooltip-global/src/index.ts'),
      // ── Gabi ──
      '@nucleo/gabi-field-icon-global':            nucleo('Gabi/gabi-field-icon-global/src/index.ts'),
      // ── Layout ──
      '@nucleo/cabecalho-global':                  nucleo('Layout/cabecalho-global/src/index.ts'),
      '@nucleo/card-global':                       nucleo('Layout/card-global/src/index.ts'),
      '@nucleo/localizador-global':                nucleo('Layout/localizador-global/src/index.ts'),
      '@nucleo/logo-global':                       nucleo('Layout/logo-global/src/index.ts'),
      '@nucleo/menu-lateral-global':               nucleo('Layout/menu-lateral-global/src/index.ts'),
      '@nucleo/menu-topo-global':                  nucleo('Layout/menu-topo-global/src/index.ts'),
      '@nucleo/pagina-global':                     nucleo('Layout/pagina-global/src/index.ts'),
      '@nucleo/tela-produto-global':               nucleo('Layout/tela-produto-global/src/index.ts'),
      '@nucleo/usuario-global':                    nucleo('Layout/usuario-global/src/index.ts'),
      '@nucleo/view-toggle-global':                nucleo('Layout/view-toggle-global/src/index.ts'),
      // ── Modais ──
      '@nucleo/modal-confirmar-excluir-global':    nucleo('Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global':      nucleo('Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-formulario-global':           nucleo('Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-global':                      nucleo('Modais/modal-global/src/index.ts'),
      '@nucleo/modal-passo-passo-global':          nucleo('Modais/modal-passo-passo-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global':          nucleo('Modais/modal-sem-sessoes-global/src/index.ts'),
      // ── Kanban ──
      '@nucleo/kanban-global':                     nucleo('Kanban/kanban-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/select-colunas-global':             nucleo('Tabelas/select-colunas-global/src/index.ts'),
      '@nucleo/tabela-global':                     nucleo('Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-virtual-global':             nucleo('Tabelas/tabela-virtual-global/src/index.ts'),
      // ── Utilidades ──
      '@nucleo/utils':                             nucleo('Utilidades/utils/src/index.ts'),
      // ── Dashboard ──
      '@nucleo/dashboard':                         nucleo('Dashboard'),
      // ── Shell / Tenant ──
      '@gravity/shell': path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
      '@shell':         path.resolve(monorepoRoot, 'servicos-global/shell/index.ts'),
      '@tenant/gabi':   path.resolve(monorepoRoot, 'servicos-global/tenant/gabi'),
      '@tenant':        path.resolve(monorepoRoot, 'servicos-global/tenant'),
      '@produto':       path.resolve(monorepoRoot, 'servicos-global/produto'),
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
