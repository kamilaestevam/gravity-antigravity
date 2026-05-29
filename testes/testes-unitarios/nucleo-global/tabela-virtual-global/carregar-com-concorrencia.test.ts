/// <reference types="vitest/globals" />

import { carregarComConcorrencia } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/utils/carregarComConcorrencia'

describe('carregarComConcorrencia', () => {
  it('limita requests paralelos', async () => {
    let emVoo = 0
    let pico = 0

    const items = Array.from({ length: 12 }, (_, i) => i)

    await carregarComConcorrencia(items, 3, async n => {
      emVoo++
      pico = Math.max(pico, emVoo)
      await new Promise(r => setTimeout(r, 5))
      emVoo--
      return n * 2
    })

    expect(pico).toBeLessThanOrEqual(3)
    expect(pico).toBeGreaterThan(1)
  })
})
