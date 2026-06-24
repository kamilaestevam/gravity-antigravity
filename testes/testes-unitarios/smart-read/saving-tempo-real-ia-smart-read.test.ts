import { describe, expect, it } from 'vitest'
import {
  calcularSavingDocumentoSmartRead,
  resolverSavingTransacaoLeituraSmartRead,
} from '../../../servicos-global/produto/smart-read/shared/metricas-transacao-leitura-smart-read.ts'

describe('saving com tempo real de IA', () => {
  it('BL: manual 12,10 min menos 45s de IA gera saving positivo', () => {
    const saving = calcularSavingDocumentoSmartRead('bl', 0, 45 / 60)
    expect(saving.digitação).toBeCloseTo(12.1 - 0.75, 2)
  })

  it('resolverSaving usa tempo_extracao_ia_ms agregado da leitura', () => {
    const resultado = resolverSavingTransacaoLeituraSmartRead({
      saving_total_minutos: 0,
      saving_total_brl: 0,
      total_documentos: 1,
      total_campos_errados: 0,
      tipos_documento: 'Bill of Lading',
      tempo_extracao_ia_ms: 90_000,
    })

    expect(resultado?.saving_total_minutos).toBeCloseTo(12.1 - 1.5, 2)
    expect(resultado?.saving_total_brl).toBeGreaterThan(0)
  })
})
