import { describe, expect, it } from 'vitest'
import { passoPorStatusFluxoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/shared/passo-status-fluxo-leitura-smart-read'
import { montarLeituraFallbackRetomarListaSmartRead } from '../../../../servicos-global/produto/smart-read/shared/montar-leitura-fallback-retomar-lista-smart-read'
import { resolverPassoRetomarDaListaSmartRead } from '../../../../servicos-global/produto/smart-read/shared/resolver-passo-retomar-da-lista-smart-read'

describe('resolverPassoRetomarDaListaSmartRead', () => {
  it('prioriza passo 4 quando status fluxo é RESULTADO mesmo com status DATI PROCESSING', () => {
    expect(
      resolverPassoRetomarDaListaSmartRead({
        status_leitura: 'PROCESSING',
        passo_atual_leitura: null,
        status_fluxo_leitura: 'RESULTADO_LEITURAS',
      }),
    ).toBe(4)
  })

  it('usa passo_atual persistido quando maior que derivado do status DATI', () => {
    expect(
      resolverPassoRetomarDaListaSmartRead({
        status_leitura: 'PROCESSING',
        passo_atual_leitura: 3,
        status_fluxo_leitura: 'ANALISE_ARQUIVO',
      }),
    ).toBe(3)
  })
})

describe('passoPorStatusFluxoLeituraSmartRead', () => {
  it('mapeia RESULTADO_LEITURAS para passo 4', () => {
    expect(passoPorStatusFluxoLeituraSmartRead('RESULTADO_LEITURAS')).toBe(4)
  })
})

describe('montarLeituraFallbackRetomarListaSmartRead', () => {
  it('monta leitura mínima com total da lista', () => {
    const leitura = montarLeituraFallbackRetomarListaSmartRead('leit-1', {
      nome_leitura: 'LEITURA PASSO 2',
      total_arquivos: 1,
      status_leitura: 'COMPLETED',
      status_fluxo_leitura: 'RESULTADO_LEITURAS',
      passo_retomar: 4,
    })
    expect(leitura).toMatchObject({
      id_leitura: 'leit-1',
      nome_leitura: 'LEITURA PASSO 2',
      total_arquivos: 1,
      status_leitura: 'COMPLETED',
      arquivos: [],
    })
  })

  it('retorna null sem metadados úteis', () => {
    expect(montarLeituraFallbackRetomarListaSmartRead('leit-1', null)).toBeNull()
    expect(montarLeituraFallbackRetomarListaSmartRead('leit-1', { total_arquivos: 0 })).toBeNull()
  })
})
