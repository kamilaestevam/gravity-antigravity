import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom', 'zustand', 'i18next', 'react-i18next'],
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
      // ── Modais ──
      '@nucleo/modal-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-global/src/index.ts'),
      '@nucleo/modal-formulario-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-global/src/index.ts'),
      '@nucleo/modal-formulario-abas-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-formulario-abas-global/src/index.ts'),
      '@nucleo/modal-sem-sessoes-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-sem-sessoes-global/src/index.ts'),
      '@nucleo/modal-campo-select-global': path.resolve(__dirname, '../../nucleo-global/Modais/modal-select-global/src/index.ts'),
      // ── Tabelas ──
      '@nucleo/tabela-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-camadas-global': path.resolve(__dirname, '../../nucleo-global/Tabelas/tabela-camadas-global/src/index.ts'),
      // ── Utilidades ──
      '@nucleo/utils': path.resolve(__dirname, '../../nucleo-global/Utilidades/utils/src/index.ts'),
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
      },
      // Configurador API
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
})

