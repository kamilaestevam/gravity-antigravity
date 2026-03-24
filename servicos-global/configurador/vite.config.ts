import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nucleo/botao-global': path.resolve(
        __dirname,
        '../../nucleo-global/botao-global/src/index.ts'
      ),
      '@nucleo/tabela-global': path.resolve(
        __dirname,
        '../../nucleo-global/tabela-global/src/index.ts'
      ),
      '@nucleo/utils': path.resolve(
        __dirname,
        '../../nucleo-global/utils/src/index.ts'
      ),
    },
  },
  server: {
    port: 8003,
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
})

