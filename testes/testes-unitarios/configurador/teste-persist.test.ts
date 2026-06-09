// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  calcularQuantidadePassosTeste,
  entradaJsonLegadaParaApi,
  extrairEscopoDoModulo,
  extrairIdPlanoTeste,
} from '../../../servicos-global/configurador/server/lib/teste-persist.js'
import type { TestLogEntry } from '../../../servicos-global/configurador/server/utils/playwright-parser.js'

describe('teste-persist', () => {
  it('extrai escopo e id do plano', () => {
    expect(extrairEscopoDoModulo('TST-EMT-PEDIDO-000001')).toBe('PEDIDO')
    expect(extrairIdPlanoTeste('TST-EMT-PEDIDO-000001')).toBe('TST-EMT-PEDIDO-000001')
  })

  it('conta passos EMT e default E2E', () => {
    const emt: TestLogEntry = {
      type: 'EMT', module: 'TST-EMT-PEDIDO-000001', test_name: 'Run',
      result: 'APROVADO', duration: '1ms', error_log: null, ai_analysis: null,
      success_log: '✓ a\n✗ b',
    }
    expect(calcularQuantidadePassosTeste(emt)).toBe(2)
    expect(calcularQuantidadePassosTeste({ ...emt, type: 'E2E' })).toBe(1)
  })

  it('converte JSON legado para DDD', () => {
    const api = entradaJsonLegadaParaApi({
      id: '1', type: 'EMT', module: 'TST-EMT-PEDIDO-000001', test_name: 'X',
      result: 'APROVADO', duration: '1ms', success_log: '✓ ok',
    })
    expect(api.id_teste).toBe('1')
    expect(api.tipo_teste).toBe('EMT')
    expect(api.quantidade_passos_teste).toBe(1)
  })
})
