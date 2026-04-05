import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'zustand', 'i18next', 'react-i18next', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    alias: {
      // ── Botoes ──
      '@nucleo/botao-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botao-global/src/index.ts'),
      '@nucleo/botao-novo-admin-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botao-novo-admin-global/src/index.ts'),
      '@nucleo/botoes-salvar-global': path.resolve(__dirname, '../../nucleo-global/Botoes/botoes-salvar-global/src/index.ts'),
      // ── Campos ──
      '@nucleo/campo-calendario-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-calendario-global/src/index.ts'),
      '@nucleo/campo-geral-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-geral-global/src/index.ts'),
      '@nucleo/campo-localizar-expandido-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-localizar-expandido-global/src/index.ts'),
      '@nucleo/campo-select-global': path.resolve(__dirname, '../../nucleo-global/Campos/campo-select-global/src/index.ts'),
      '@nucleo/switch-global': path.resolve(__dirname, '../../nucleo-global/Campos/switch-global/src/index.ts'),
      '@nucleo/modal-confirmar-excluir-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-confirmar-excluir-global/src/index.ts'),
      '@nucleo/modal-workspace-inicial-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-workspace-inicial-global/src/index.ts'),
      // ── Feedback ──
      '@nucleo/mensageria-global': path.resolve(__dirname, '../../nucleo-global/Mensageria Global/mensageria-global/src/index.ts'),
      '@nucleo/status-badge-global': path.resolve(__dirname, '../../nucleo-global/Feedback/status-badge-global/src/index.ts'),
      '@nucleo/status-salvar-global': path.resolve(__dirname, '../../nucleo-global/Feedback/status-salvar-global/src/index.ts'),
      '@nucleo/tooltip-global': path.resolve(__dirname, '../../nucleo-global/Feedback/tooltip-global/src/index.ts'),
      // ── Layout ──
      '@nucleo/cabecalho-global': path.resolve(__dirname, '../../nucleo-global/Layout/cabecalho-global/src/index.ts'),
      '@nucleo/logo-global': path.resolve(__dirname, '../../nucleo-global/Layout/logo-global/src/index.ts'),
      '@nucleo/pagina-global': path.resolve(__dirname, '../../nucleo-global/Layout/pagina-global/src/index.ts'),
      '@nucleo/card-global': path.resolve(__dirname, '../../nucleo-global/Layout/card-global/src/index.ts'),
      '@nucleo/usuario-global': path.resolve(__dirname, '../../nucleo-global/Layout/usuario-global/src/index.ts'),
      '@nucleo/view-toggle-global': path.resolve(__dirname, '../../nucleo-global/Layout/view-toggle-global/src/index.ts'),
      '@nucleo/menu-lateral-global': path.resolve(__dirname, '../../nucleo-global/Layout/menu-lateral-global/src/index.ts'),
      '@nucleo/language-switcher-global': path.resolve(__dirname, '../../nucleo-global/Layout/language-switcher-global/src/index.ts'),
      '@nucleo/localizador-global': path.resolve(__dirname, '../../nucleo-global/Layout/localizador-global/src/index.ts'),
      // ── Modais ──
      '@nucleo/modal-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-global/src/index.ts'),
      '@nucleo/modal-formulario-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-sem-sessoes-global/src/index.ts'),
      '@nucleo/modal-campo-select-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-select-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/kanban-global': path.resolve(__dirname, '../../nucleo-global/Kanban/kanban-global/src/index.ts'),
      // peerDeps do kanban-global — forçar resolução a partir do configurador
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities'),
      '@nucleo/tabela-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-virtual-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-virtual-global/src/index.ts'),
      '@nucleo/tabela-camadas-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-camadas-global/src/index.ts'),
      '@nucleo/select-colunas-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/select-colunas-global/src/index.ts'),
      // ── Layout (extras) ──
      '@nucleo/tela-produto-global': path.resolve(__dirname, '../../nucleo-global/Layout/tela-produto-global/src/index.ts'),
      '@nucleo/menu-topo-global': path.resolve(__dirname, '../../nucleo-global/Layout/menu-topo-global/src/index.ts'),
      // ── Logo ──
      '@nucleo/logo-produtos': path.resolve(__dirname, '../../nucleo-global/Logo/produtos/src/index.ts'),
      // ── Dashboard ──
      '@nucleo/dashboard': path.resolve(__dirname, '../../nucleo-global/Dashboard'),
      '@nucleo/query-builder-global': path.resolve(__dirname, '../../nucleo-global/Dashboard/QueryBuilder'),
      // ── Gabi ──
      '@nucleo/gabi-field-icon-global': path.resolve(__dirname, '../../nucleo-global/Gabi/gabi-field-icon-global/src/index.ts'),
      // ── Modais (extras) ──
      '@nucleo/modal-passo-passo-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-passo-passo-global/src/index.ts'),
      '@nucleo/modal-gabi-caixa-aviso': path.resolve(__dirname, '../../nucleo-global/Modais/modal-gabi-caixa-aviso/src/index.ts'),
      // ── Templates ──
      '@nucleo/pagina-dashboard-global': path.resolve(__dirname, '../../nucleo-global/Templates/pagina-dashboard-global/src/index.ts'),
      '@nucleo/pagina-formulario-global': path.resolve(__dirname, '../../nucleo-global/Templates/pagina-formulario-global/src/index.ts'),
      '@nucleo/pagina-tabela-global': path.resolve(__dirname, '../../nucleo-global/Templates/pagina-tabela-global/src/index.ts'),
      // ── Composição ──
      '@nucleo/flex-global': path.resolve(__dirname, '../../nucleo-global/Composicao/flex-global/src/index.ts'),
      '@nucleo/grid-global': path.resolve(__dirname, '../../nucleo-global/Composicao/grid-global/src/index.ts'),
      '@nucleo/secao-global': path.resolve(__dirname, '../../nucleo-global/Composicao/secao-global/src/index.ts'),
      '@nucleo/stack-global': path.resolve(__dirname, '../../nucleo-global/Composicao/stack-global/src/index.ts'),
      // ── Utilidades ──
      '@nucleo/utils': path.resolve(__dirname, '../../nucleo-global/Utilidades/utils/src/index.ts'),
      '@nucleo/export-utils': path.resolve(__dirname, '../../nucleo-global/Utilidades/export-utils/exportUtils.ts'),
      '@nucleo/Utilidades/localization/provider': path.resolve(__dirname, '../../nucleo-global/Utilidades/localization/provider.tsx'),
      '@nucleo/Utilidades/localization/i18n': path.resolve(__dirname, '../../nucleo-global/Utilidades/localization/i18n.ts'),
      // ── Login ──

      '@nucleo/login-global': path.resolve(__dirname, '../../nucleo-global/Login/login-global/src/index.ts'),
      '@tenant/gabi': path.resolve(__dirname, '../tenant/gabi'),
      '@tenant/dashboard': path.resolve(__dirname, '../tenant/dashboard'),
      '@tenant/atividades': path.resolve(__dirname, '../tenant/atividades'),
      '@gravity/shell': path.resolve(
        __dirname,
        '../shell/index.ts'
      ),
      // ── Aliases dos Produtos (para lazy-load dentro do Configurador) ──
      '@shell': path.resolve(__dirname, '../shell'),
      '@tenant': path.resolve(__dirname, '../tenant'),
      '@produto': path.resolve(__dirname, '../../produto'),
    },
  },
  optimizeDeps: {
    include: ['react-i18next', 'i18next', 'zustand', '@clerk/clerk-react'],
    // @phosphor-icons/react REMOVIDO — pre-bundleia 5000+ ícones desnecessariamente
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
      // Gabi IA API (porta 8000) — deve vir antes do /api generico
      '/api/v1/gabi': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        onError(err, _req, res) {
          // Backend indisponível — evita crash do Vite (ex: ECONNRESET no restart)
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
      // Configurador API
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        onError(err, _req, res) {
          // Backend indisponível — evita crash do Vite (ex: ECONNRESET no restart do tsx)
          if (!res.headersSent) res.writeHead(502).end()
        },
      },
    },
  },
})

