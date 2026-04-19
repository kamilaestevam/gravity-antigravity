// Config de testes unitários do serviço notificacoes.
// Fica dentro do pacote para que `vitest/config` resolva para a versão local
// (1.6.1) — o root package.json tem vitest 4.x que não é compatível com vite 5.x.
// Os arquivos de teste ficam na pasta centralizada testes/ da raiz do monorepo.

import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')  // monorepo root

const resolveTsFromJs = {
  name: 'resolve-ts-from-js',
  resolveId(source: string, importer: string | undefined) {
    if (source.endsWith('.js') && importer) {
      return path.resolve(path.dirname(importer), source.replace(/\.js$/, '.ts'))
    }
  },
}

export default defineConfig({
  plugins: [resolveTsFromJs],
  test: {
    // globals: true → test files não precisam importar `vitest`, evitando que
    // `import from 'vitest'` resolva para a versão 4.x hoistada no root do monorepo
    // (incompatível com vite 5.x). O runner injeta os helpers (vi, describe, it, expect)
    // no contexto de cada worker diretamente a partir desta versão 1.6.1 local.
    globals: true,
    environment: 'node',
    // Paths absolutos → `root` permanece na pasta do serviço (notificacoes),
    // garantindo que a resolução de pacotes encontre vitest 1.6.1 local.
    include: [root.replace(/\\/g, '/') + '/testes/testes-unitarios/tenant/notificacoes/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      RESEND_WEBHOOK_SECRET: 'whsec_Z3Jhdml0eS10ZXN0LXNlY3JldC1mb3Itdml0ZXN0ISE=',
      TENANT_DATABASE_URL:   'postgres://test:test@localhost:5432/test',
      INTERNAL_API_KEY:      'test-internal-key',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: path.join(root, 'testes/testes-unitarios/tenant/notificacoes/resultados'),
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
})
