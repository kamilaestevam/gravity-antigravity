import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      // Resolve .js -> .tsx primeiro (componentes React), depois .ts
      const baseTsx = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.tsx'))
      const baseTs = path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
      try {
        require('node:fs').statSync(baseTsx)
        return baseTsx
      } catch {
        return baseTs
      }
    }
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  root,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['testes/testes-funcionais/processo/**/*.test.{ts,tsx}'],
    env: { NODE_ENV: 'test' },
  },
})
