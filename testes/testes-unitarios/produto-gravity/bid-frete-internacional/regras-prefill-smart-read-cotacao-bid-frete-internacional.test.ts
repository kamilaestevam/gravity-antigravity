import { describe, expect, it } from 'vitest'
import {
  avaliarCamposFaltantesPrefillCotacaoBidFrete,
  exigeCampoArmazenagemLclPrefill,
  resolverPassoInicialPrefillSmartRead,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/regras-prefill-smart-read-cotacao-bid-frete-internacional.js'
import type { PrefillFormularioCotacaoBidFreteSmartRead } from '../../../../servicos-global/produto/smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

const prefillBase: PrefillFormularioCotacaoBidFreteSmartRead = {
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'LCL',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Peças',
  incoterm_cotacao_bid_frete_internacional: 'EXW',
  quantidade_volume_cotacao_bid_frete_internacional: 1,
  porto_origem_cotacao_bid_frete_internacional: 'ARBUE',
  porto_destino_cotacao_bid_frete_internacional: 'BRSSZ',
  opcao_incluir_armazenagem_cotacao: 'nao',
}

describe('regrasPrefillSmartReadCotacaoBidFrete', () => {
  it('exige armazenagem apenas em MARITIMO + LCL', () => {
    expect(exigeCampoArmazenagemLclPrefill(prefillBase)).toBe(true)
    expect(exigeCampoArmazenagemLclPrefill({
      ...prefillBase,
      modalidade_cotacao_bid_frete_internacional: 'FCL',
      tipo_container_cotacao_bid_frete_internacional: '22G1',
    })).toBe(false)
  })

  it('abre em fornecedores quando LCL sem armazenagem e campos completos', () => {
    expect(resolverPassoInicialPrefillSmartRead(prefillBase)).toBe('fornecedores')
    expect(avaliarCamposFaltantesPrefillCotacaoBidFrete(prefillBase)).toEqual([])
  })

  it('abre em origem quando faltam portos marítimos', () => {
    const incompleto = {
      ...prefillBase,
      porto_origem_cotacao_bid_frete_internacional: '',
      porto_destino_cotacao_bid_frete_internacional: '',
    }
    expect(resolverPassoInicialPrefillSmartRead(incompleto)).toBe('origem')
    expect(avaliarCamposFaltantesPrefillCotacaoBidFrete(incompleto)).toContain('Porto origem')
  })

  it('abre em armazenagem quando LCL com opcao sim', () => {
    const comArmazem = { ...prefillBase, opcao_incluir_armazenagem_cotacao: 'sim' as const }
    expect(resolverPassoInicialPrefillSmartRead(comArmazem)).toBe('armazenagem')
  })

  it('abre em armazenagem quando LCL sem opcao definida', () => {
    const semOpcao = { ...prefillBase, opcao_incluir_armazenagem_cotacao: '' as const }
    expect(resolverPassoInicialPrefillSmartRead(semOpcao)).toBe('armazenagem')
    expect(avaliarCamposFaltantesPrefillCotacaoBidFrete(semOpcao)).toContain('Armazenagem LCL')
  })
})
