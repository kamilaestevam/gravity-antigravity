import { describe, expect, it } from 'vitest'
import {
  aplicarRegrasDerivadasPrefill,
  deveExibirExtrasDestinoPrefill,
  deveExibirExtrasOrigemPrefill,
  inferirModalidadeRodoviarioPrefill,
  inferirTipoOperacaoPrefill,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/classificacao-prefill-smart-read-cotacao-bid-frete-internacional.js'

describe('classificacaoPrefillSmartReadCotacaoBidFrete', () => {
  it('infere importação quando destino BR e origem estrangeira', () => {
    expect(inferirTipoOperacaoPrefill({ textoOperacao: null, paisOrigem: 'AR', paisDestino: 'BR' })).toBe('IMPORTACAO')
  })

  it('infere exportação quando origem BR e destino estrangeiro', () => {
    expect(inferirTipoOperacaoPrefill({ textoOperacao: null, paisOrigem: 'BR', paisDestino: 'US' })).toBe('EXPORTACAO')
  })

  it('prioriza texto EXPORT/IMPORT no campo operação', () => {
    expect(inferirTipoOperacaoPrefill({ textoOperacao: 'exportação', paisOrigem: 'BR', paisDestino: 'BR' })).toBe('EXPORTACAO')
    expect(inferirTipoOperacaoPrefill({ textoOperacao: 'import', paisOrigem: 'BR', paisDestino: 'US' })).toBe('IMPORTACAO')
  })

  it('infere FTL por peso único volume ou texto', () => {
    expect(inferirModalidadeRodoviarioPrefill({ pesoKg: 25_000, quantidadeVolumes: 1, textoModalidade: null })).toBe('RODOVIARIO_FTL')
    expect(inferirModalidadeRodoviarioPrefill({ pesoKg: 100, quantidadeVolumes: 2, textoModalidade: 'FTL' })).toBe('RODOVIARIO_FTL')
    expect(inferirModalidadeRodoviarioPrefill({ pesoKg: 100, quantidadeVolumes: 2, textoModalidade: null })).toBe('RODOVIARIO_LTL')
  })

  it('ativa extras origem em EXW + importação e destino em DDP/DPU + exportação', () => {
    expect(deveExibirExtrasOrigemPrefill({
      tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
      incoterm_cotacao_bid_frete_internacional: 'EXW',
    })).toBe(true)
    expect(deveExibirExtrasDestinoPrefill({
      tipo_operacao_cotacao_bid_frete_internacional: 'EXPORTACAO',
      incoterm_cotacao_bid_frete_internacional: 'DDP',
    })).toBe(true)
    expect(deveExibirExtrasDestinoPrefill({
      tipo_operacao_cotacao_bid_frete_internacional: 'EXPORTACAO',
      incoterm_cotacao_bid_frete_internacional: 'DPU',
    })).toBe(true)
    expect(deveExibirExtrasDestinoPrefill({
      tipo_operacao_cotacao_bid_frete_internacional: 'EXPORTACAO',
      incoterm_cotacao_bid_frete_internacional: 'DDU',
    })).toBe(false)
  })

  it('aplicarRegrasDerivadasPrefill sincroniza flags de extras', () => {
    const comExtras = aplicarRegrasDerivadasPrefill({
      tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
      incoterm_cotacao_bid_frete_internacional: 'EXW',
    })
    expect(comExtras.exibir_campos_extras_origem_cotacao).toBe(true)
    expect(comExtras.exibir_campos_extras_destino_cotacao).toBe(false)
  })
})
