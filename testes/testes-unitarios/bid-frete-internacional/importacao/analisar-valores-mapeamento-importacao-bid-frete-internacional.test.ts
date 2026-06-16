/// <reference types="vitest/globals" />

import { analisarValoresMapeamentoImportacaoBid } from '../../../../servicos-global/produto/bid-frete-internacional/shared/analisar-valores-mapeamento-importacao-bid-frete-internacional'
import type { ColunaMapeadaBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/tipos-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from '../../../../servicos-global/produto/bid-frete-internacional/shared/rota-cotacao-bid-frete-internacional'

describe('analisar-valores-mapeamento-importacao-bid-frete-internacional', () => {
  const ctx: ContextoCatalogoRota = {
    portos: [
      { codigo_unlocode_porto: 'BRSSZ', nome_porto: 'Santos', codigo_pais_porto: 'BR' },
      { codigo_unlocode_porto: 'CNSHA', nome_porto: 'Shanghai', codigo_pais_porto: 'CN' },
    ],
    aeroportos: [],
  }

  const mapeamentoBase: ColunaMapeadaBidFreteInternacional[] = [
    { coluna_arquivo: 'Operacao', campo_sistema: 'tipo_operacao_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Importação' },
    { coluna_arquivo: 'Modal', campo_sistema: 'modal_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Marítimo' },
    { coluna_arquivo: 'Porto origem', campo_sistema: 'porto_origem_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'mIAMI' },
    { coluna_arquivo: 'Porto destino', campo_sistema: 'porto_destino_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'santos' },
    { coluna_arquivo: 'Mercadoria', campo_sistema: 'descricao_mercadoria_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Carga' },
    { coluna_arquivo: 'Incoterm', campo_sistema: 'incoterm_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'FOB' },
    { coluna_arquivo: 'Qtd', campo_sistema: 'quantidade_volume_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: '1' },
  ]

  it('detecta porto inválido mesmo com confiança 99% na coluna', () => {
    const linhasBrutas = [{
      Operacao: 'Importação',
      Modal: 'Marítimo',
      'Porto origem': 'mIAMI',
      'Porto destino': 'CNSHA — Shanghai',
      Mercadoria: 'Carga',
      Incoterm: 'FOB',
      Qtd: '1',
    }]

    const analise = analisarValoresMapeamentoImportacaoBid(linhasBrutas, mapeamentoBase, ctx)

    expect(analise.bloqueiaAvanco).toBe(true)
    expect(analise.errosPorCampo.some(e => e.campo === 'porto_origem_cotacao_bid_frete_internacional')).toBe(true)
  })

  it('libera avanço quando valores batem no catálogo', () => {
    const mapeamentoOk: ColunaMapeadaBidFreteInternacional[] = [
      ...mapeamentoBase.filter(c => !['Porto origem', 'Porto destino'].includes(c.coluna_arquivo)),
      { coluna_arquivo: 'Porto origem', campo_sistema: 'porto_origem_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'BRSSZ — Santos' },
      { coluna_arquivo: 'Porto destino', campo_sistema: 'porto_destino_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'CNSHA — Shanghai' },
      { coluna_arquivo: 'Modalidade', campo_sistema: 'modalidade_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'FCL' },
    ]

    const linhasBrutas = [{
      Operacao: 'Importação',
      Modal: 'Marítimo',
      Modalidade: 'FCL',
      'Porto origem': 'BRSSZ — Santos',
      'Porto destino': 'CNSHA — Shanghai',
      Mercadoria: 'Carga',
      Incoterm: 'FOB',
      Qtd: '1',
    }]

    const analise = analisarValoresMapeamentoImportacaoBid(linhasBrutas, mapeamentoOk, ctx)

    expect(analise.bloqueiaAvanco).toBe(false)
    expect(analise.totalLinhasComErro).toBe(0)
  })
})
