// vite.config.ts — tela-produto-global/demo
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const monoRoot    = path.resolve(__dirname, '../../../..')
const nucleo      = (sub: string) => path.resolve(monoRoot, `nucleo-global/${sub}`)

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
      // ── Tabelas ──
      '@nucleo/tabela-global':          nucleo('Tabelas/tabela-global/src/index.ts'),
      '@nucleo/tabela-virtual-global':  nucleo('Tabelas/tabela-virtual-global/src/index.ts'),
      '@nucleo/tabela-camadas-global':  nucleo('Tabelas/tabela-camadas-global/src/index.ts'),
      // ── Utils ──
      '@nucleo/utils':                  nucleo('Utilidades/utils/src/index.ts'),
    },
  },

  optimizeDeps: {
    include: [
      '@phosphor-icons/react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@tanstack/react-virtual',
    ],
  },

  server: {
    port: 5200,
    fs: { allow: [monoRoot] },
  },
})
