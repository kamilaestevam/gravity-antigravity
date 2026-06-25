/// <reference types="vitest/globals" />

import { aplicarEdicaoValorColunaImportacaoBid } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/aplicar-edicao-valor-coluna-importacao-bid-frete-internacional'
import { processarEdicaoValorColunaMapeamentoImportacaoBid } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/processar-edicao-valor-coluna-mapeamento-importacao-bid-frete-internacional'
import type { ColunaMapeadaBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/tipos-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/rota-cotacao-bid-frete-internacional'

describe('aplicar-edicao-valor-coluna-importacao-bid-frete-internacional', () => {
  const ctx: ContextoCatalogoRota = {
    portos: [
      { codigo_unlocode_porto: 'BRSSZ', nome_porto: 'Santos', codigo_pais_porto: 'BR' },
      { codigo_unlocode_porto: 'CNSHA', nome_porto: 'Shanghai', codigo_pais_porto: 'CN' },
    ],
    aeroportos: [],
  }

  const mapeamentoPortoOrigem: ColunaMapeadaBidFreteInternacional[] = [
    { coluna_arquivo: 'Operacao', campo_sistema: 'tipo_operacao_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Importação' },
    { coluna_arquivo: 'Modal', campo_sistema: 'modal_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Marítimo' },
    { coluna_arquivo: 'Porto origem', campo_sistema: 'porto_origem_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'mIAMI' },
    { coluna_arquivo: 'Porto destino', campo_sistema: 'porto_destino_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'CNSHA — Shanghai' },
    { coluna_arquivo: 'Modalidade', campo_sistema: 'modalidade_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'FCL' },
    { coluna_arquivo: 'Mercadoria', campo_sistema: 'descricao_mercadoria_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Carga' },
    { coluna_arquivo: 'Incoterm', campo_sistema: 'incoterm_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'FOB' },
    { coluna_arquivo: 'Qtd', campo_sistema: 'quantidade_volume_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: '1' },
  ]

  const linhaBase = {
    Operacao: 'Importação',
    Modal: 'Marítimo',
    Modalidade: 'FCL',
    'Porto origem': 'mIAMI',
    'Porto destino': 'CNSHA — Shanghai',
    Mercadoria: 'Carga',
    Incoterm: 'FOB',
    Qtd: '1',
  }

  it('substitui todas as células iguais ao valor antigo (case-insensitive)', () => {
    const linhasBase = [
      { 'Porto origem': 'mIAMI', Outro: 'A' },
      { 'Porto origem': 'mIAMI', Outro: 'B' },
      { 'Porto origem': 'CNSHA — Shanghai', Outro: 'C' },
    ]

    const resultado = aplicarEdicaoValorColunaImportacaoBid(
      linhasBase,
      'Porto origem',
      'mIAMI',
      'BRSSZ — Santos',
    )

    expect(resultado[0]['Porto origem']).toBe('BRSSZ — Santos')
    expect(resultado[1]['Porto origem']).toBe('BRSSZ — Santos')
    expect(resultado[2]['Porto origem']).toBe('CNSHA — Shanghai')
  })

  it('corrige todas as linhas inválidas do campo mesmo com valores diferentes na coluna', () => {
    const linhas = [
      { ...linhaBase, 'Porto origem': 'mIAMI' },
      { ...linhaBase, 'Porto origem': 'Miami' },
      { ...linhaBase, 'Porto origem': 'USMIA' },
      { ...linhaBase, 'Porto origem': 'BRSSZ — Santos' },
    ]

    const resultado = aplicarEdicaoValorColunaImportacaoBid(
      linhas,
      'Porto origem',
      'Miami',
      'BRSSZ — Santos',
      {
        mapeamento: mapeamentoPortoOrigem,
        ctx,
        campoSistema: 'porto_origem_cotacao_bid_frete_internacional',
      },
    )

    expect(resultado[0]['Porto origem']).toBe('BRSSZ — Santos')
    expect(resultado[1]['Porto origem']).toBe('BRSSZ — Santos')
    expect(resultado[2]['Porto origem']).toBe('BRSSZ — Santos')
    expect(resultado[3]['Porto origem']).toBe('BRSSZ — Santos')
  })

  it('processamento completo retorna ok após correção válida no catálogo', () => {
    const linhas = [
      { ...linhaBase, 'Porto origem': 'mIAMI' },
      { ...linhaBase, 'Porto origem': 'Miami' },
    ]

    const processado = processarEdicaoValorColunaMapeamentoImportacaoBid(
      mapeamentoPortoOrigem,
      linhas,
      2,
      'mIAMI',
      'BRSSZ — Santos',
      ctx,
    )

    expect(processado).not.toBeNull()
    expect(processado?.resultadoCampo).toBe('ok')
    expect(processado?.linhasComErroCampo).toBe(0)
  })

  it('processamento completo mantém erro quando valor continua inválido', () => {
    const linhas = [{ ...linhaBase, 'Porto origem': 'mIAMI' }]

    const processado = processarEdicaoValorColunaMapeamentoImportacaoBid(
      mapeamentoPortoOrigem,
      linhas,
      2,
      'mIAMI',
      'Miami',
      ctx,
    )

    expect(processado?.resultadoCampo).toBe('erro')
    expect(processado?.linhasComErroCampo).toBeGreaterThan(0)
  })
})
