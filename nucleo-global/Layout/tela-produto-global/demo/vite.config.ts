// vite.config.ts — tela-produto-global/demo
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const monoRoot    = path.resolve(__dirname, '../../../..')
const nucleo      = (sub: string) => path.resolve(monoRoot, `nucleo-global/${sub}`)
const tenant      = (sub: string) => path.resolve(monoRoot, `servicos-global/tenant/${sub}`)

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', 'react-router-dom'],
    alias: {
      // ── Layout ──
      '@nucleo/tela-produto-global':    nucleo('Layout/tela-produto-global/src/index.ts'),
      '@nucleo/menu-topo-global':       nucleo('Layout/menu-topo-global/src/index.ts'),
      '@nucleo/menu-lateral-global':    nucleo('Layout/menu-lateral-global/src/index.ts'),
      '@nucleo/cabecalho-global':       nucleo('Layout/cabecalho-global/src/index.ts'),
      '@nucleo/card-global':            nucleo('Layout/card-global/src/index.ts'),
      '@nucleo/logo-global':            nucleo('Layout/logo-global/src/index.ts'),
      '@nucleo/logo-produtos':          nucleo('Logo/produtos/src/index.ts'),
      '@nucleo/localizador-global':     nucleo('Layout/localizador-global/src/index.ts'),
      '@nucleo/usuario-global':         nucleo('Layout/usuario-global/src/index.ts'),
      '@nucleo/view-toggle-global':     nucleo('Layout/view-toggle-global/src/index.ts'),
      '@nucleo/language-switcher-global': nucleo('Layout/language-switcher-global/src/index.ts'),
      // ── Feedback ──
      '@nucleo/tooltip-global':         nucleo('Feedback/tooltip-global/src/index.ts'),
      '@nucleo/status-badge-global':    nucleo('Feedback/status-badge-global/src/index.ts'),
      '@nucleo/mensageria-global':      nucleo('Mensageria Global/mensageria-global/src/index.ts'),
      // ── Botões ──
      '@nucleo/botao-global':           nucleo('Botoes/botao-global/src/index.ts'),
      '@nucleo/botoes-salvar-global':   nucleo('Botoes/botoes-salvar-global/src/index.ts'),
      // ── Campos ──
      '@nucleo/campo-geral-global':     nucleo('Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-calendario-global':nucleo('Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/switch-global':          nucleo('Campos/switch-global/src/index.ts'),
      '@nucleo/campo-select-global':    nucleo('Campos/campo-select-global/src/index.ts'),
      // ── Kanban ──
      '@nucleo/kanban-global':          nucleo('Kanban/kanban-global/src/index.ts'),
      // ── Modais ──
      '@nucleo/modal-global':                    nucleo('Modais/modal-global/src/index.ts'),
      '@nucleo/modal-confirmar-excluir-global':  nucleo('Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-formulario-global':         nucleo('Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global':    nucleo('Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-select-global':             nucleo('Modais/modal-select-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global':        nucleo('Modais/modal-sem-sessoes-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/select-colunas-global':  nucleo('Tabelas/select-colunas-global/src/index.ts'),
      '@nucleo/tabela-global':          nucleo('Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-virtual-global':  nucleo('Tabelas/tabela-virtual-global/src/index.ts'),
      '@nucleo/tabela-camadas-global':  nucleo('Tabelas/tabela-camadas-global/src/index.ts'),
      // ── Feedback extra ──
      '@nucleo/status-salvar-global':   nucleo('Feedback/status-salvar-global/src/index.ts'),
      // ── Tenant services ──
      '@tenant/historico':              tenant('historico-global/src/index.ts'),
      // ── Utils ──
      '@nucleo/utils':                  nucleo('Utilidades/utils/src/index.ts'),
      '@nucleo/export-utils':           nucleo('Utilidades/export-utils/exportUtils.ts'),
      // ── Export deps (resolvidos a partir do demo, não de exportUtils.ts) ──
      'exceljs':        path.resolve(__dirname, 'node_modules/exceljs'),
      'jspdf':          path.resolve(__dirname, 'node_modules/jspdf'),
      'jspdf-autotable':path.resolve(__dirname, 'node_modules/jspdf-autotable'),
    },
  },

  define: {
    'process.env': {},
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@tanstack/react-virtual',
      'react-i18next',
      'i18next',
    ],
  },

  server: {
    port: 5200,
    fs: { allow: [monoRoot] },
  },
})
