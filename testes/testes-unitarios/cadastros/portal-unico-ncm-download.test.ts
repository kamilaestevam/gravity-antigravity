// @vitest-environment node
import { describe, it, expect } from 'vitest'

// Testa helpers via reexport indireto — baixarTabelaNcm com mock de rede omitido
import { baixarTabelaNcm } from '../../../servicos-global/cadastros/server/src/connectors/portalUnicoNcm.js'

describe('portalUnicoNcm — mock', () => {
  it('baixarTabelaNcm com NCM_MOCK retorna itens 8 dígitos', async () => {
    const prev = process.env.NCM_MOCK
    process.env.NCM_MOCK = 'true'
    try {
      const itens = await baixarTabelaNcm()
      expect(itens.length).toBeGreaterThan(0)
      expect(itens.every((i) => /^\d{8}$/.test(i.codigo))).toBe(true)
    } finally {
      if (prev === undefined) delete process.env.NCM_MOCK
      else process.env.NCM_MOCK = prev
    }
  })
})
