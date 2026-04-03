import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../../..')

function nucleo(category: string, name: string) {
  return path.resolve(monorepoRoot, `nucleo-global/${category}/${name}/src/index.ts`)
}

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom', '@phosphor-icons/react', '@clerk/clerk-react', 'react-router-dom'],
    alias: {
      // -- Nucleo Global: Botoes --
      '@nucleo/botao-global': nucleo('Botoes', 'botao-global'),
      '@nucleo/botoes-salvar-global': nucleo('Botoes', 'botoes-salvar-global'),
      // -- Nucleo Global: Campos --
      '@nucleo/campo-calendario-global': nucleo('Campos', 'campo-calendario-global'),
      '@nucleo/campo-geral-global': nucleo('Campos', 'campo-geral-global'),
      '@nucleo/campo-localizar-expandido-global': nucleo('Campos', 'campo-localizar-expandido-global'),
      '@nucleo/campo-select-global': nucleo('Campos', 'campo-select-global'),
      // -- Nucleo Global: Feedback --
      '@nucleo/status-badge-global': nucleo('Feedback', 'status-badge-global'),
      '@nucleo/tooltip-global': nucleo('Feedback', 'tooltip-global'),
      // -- Nucleo Global: Layout --
      '@nucleo/cabecalho-global': nucleo('Layout', 'cabecalho-global'),
      '@nucleo/pagina-global': nucleo('Layout', 'pagina-global'),
      '@nucleo/card-global': nucleo('Layout', 'card-global'),
      '@nucleo/logo-global': nucleo('Layout', 'logo-global'),
      '@nucleo/usuario-global': nucleo('Layout', 'usuario-global'),
      '@nucleo/menu-lateral-global': nucleo('Layout', 'menu-lateral-global'),
      '@nucleo/localizador-global': nucleo('Layout', 'localizador-global'),
      // -- Nucleo Global: Modais --
      '@nucleo/modal-global': nucleo('Modais', 'modal-global'),
      '@nucleo/modal-confirmar-excluir-global': nucleo('Modais', 'modal-confirmar-excluir-global'),
      '@nucleo/modal-formulario-global': nucleo('Modais', 'modal-formulario-global'),
      // -- Nucleo Global: Tabelas --
      '@nucleo/tabela-global': nucleo('Tabelas', 'tabela-global'),
      // -- Nucleo Global: Utilidades --
      '@nucleo/utils': nucleo('Utilidades', 'utils'),
      '@nucleo/mensageria-global': path.resolve(monorepoRoot, 'nucleo-global/Mensageria Global/mensageria-global/src/index.ts'),
      // -- Shell / Tenant --
      '@gravity/shell': path.resolve(monorepoRoot, 'servicos-global/shell'),
      '@shell': path.resolve(monorepoRoot, 'servicos-global/shell'),
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
      'lucide-react',
    ],
  },

  server: {
    port: 5002,
    fs: {
      allow: [monorepoRoot],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8025',
        changeOrigin: true,
      },
    },
  },
})
