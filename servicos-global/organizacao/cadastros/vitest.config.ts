import { defineConfig } from 'vitest/config'

/**
 * Config Vitest do @tenant/cadastros.
 *
 * fileParallelism: false — testes funcionais compartilham o mesmo banco
 * `gravity-cadastros-teste` e usam `limparDadosDeTeste()` em beforeEach.
 * Rodar em paralelo causa race condition (um teste apaga dados que outro
 * acabou de criar). Unitários também ficam serializados, mas duram <1s
 * cada, então o impacto é desprezível.
 */
export default defineConfig({
  test: {
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
})
