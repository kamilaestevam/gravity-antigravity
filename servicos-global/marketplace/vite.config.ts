import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew
    // com artefatos stale em nucleo-global (ver commit 6d6eeda).
    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],
    alias: {
      '@nucleo/logo-global': path.resolve(
        __dirname,
        '../../nucleo-global/logo-global/src/index.ts'
      ),
      '@nucleo/tooltip-global': path.resolve(
        __dirname,
        '../../nucleo-global/Feedback/tooltip-global/src/index.ts'
      )
    }
  },
  server: {
    port: 8001,
    host: true,
    fs: {
      allow: [
        path.resolve(__dirname, '../..'),
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@phosphor-icons/react'],
  },
})

