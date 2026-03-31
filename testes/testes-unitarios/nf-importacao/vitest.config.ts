import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      // Map .js imports to .ts sources for the nf-importacao product
    },
  },
  plugins: [
    {
      name: 'resolve-ts-from-js',
      resolveId(source, importer) {
        if (source.endsWith('.js') && importer) {
          const tsSource = source.replace(/\.js$/, '.ts')
          const dir = path.dirname(importer)
          const resolved = path.resolve(dir, tsSource)
          return resolved
        }
        return null
      },
    },
  ],
  test: {
    environment: 'node',
    globals: true,
    include: ['testes/testes-unitarios/nf-importacao/**/*.test.ts'],
  },
})
