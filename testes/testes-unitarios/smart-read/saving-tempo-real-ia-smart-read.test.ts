import { describe, expect, it } from 'vitest'
import {
  calcularSavingDigitaçãoTransacaoLeituraSmartRead,
  calcularSavingErrosDocumentoSmartRead,
  resolverSavingDetalhadoTransacaoLeituraSmartRead,
} from '../../../servicos-global/produto/smart-read/shared/metricas-transacao-leitura-smart-read.ts'

describe('saving — base manual − tempo de leitura', () => {
  it('BL: base 12,10 min menos 9 s de leitura', () => {
    const saving = calcularSavingDigitaçãoTransacaoLeituraSmartRead(
      [{ tipo_documento: 'Bill of Lading' }],
      9,
    )
    expect(saving).toBeCloseTo(12.1 - 9 / 60, 5)
  })

  it('resolverSavingDetalhado usa tempo_processo_total_ms da transação', () => {
    const resultado = resolverSavingDetalhadoTransacaoLeituraSmartRead({
      total_documentos: 1,
      total_campos_errados: 0,
      tipos_documento: 'Bill of Lading',
      tempo_extracao_ia_ms: null,
      tempo_processo_total_ms: 9_000,
    })

    expect(resultado?.digitação).toBeCloseTo(12.1 - 9 / 60, 5)
    expect(resultado?.erros).toBe(0)
    expect(resultado?.saving_total_brl).toBeGreaterThan(0)
  })

  it('saving em erros usa base de correção por campo', () => {
    const erros = calcularSavingErrosDocumentoSmartRead('bl', 2)
    expect(erros).toBeCloseTo(2 * (2.8 - 0.75), 5)
  })
})
