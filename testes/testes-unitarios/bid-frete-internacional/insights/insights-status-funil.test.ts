import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
  STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
  lerStatusCotacaoConfigBidFreteInternacional,
  montarEtapasFunilInsightsBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/status-config-bid-frete-internacional'

describe('lerStatusCotacaoConfigBidFreteInternacional', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('retorna padrão quando localStorage está vazio', () => {
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(
      STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
    )
  })

  it('retorna padrão quando JSON é inválido para o schema', () => {
    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
      JSON.stringify([{ id: 'x' }]),
    )
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(
      STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
    )
  })

  it('lê config válida do localStorage', () => {
    const custom = [
      {
        id: 'rascunho',
        nome: 'RASCUNHO',
        rotulo: 'Meu rascunho',
        cor: '#111111',
        ordem: 1,
        is_sistema: true,
      },
    ]
    localStorage.setItem(
      CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL,
      JSON.stringify(custom),
    )
    expect(lerStatusCotacaoConfigBidFreteInternacional()).toEqual(custom)
  })
})

describe('montarEtapasFunilInsightsBidFreteInternacional', () => {
  const config = [
    { id: 'b', nome: 'EM_COTACAO', rotulo: 'Em cotação custom', cor: '#f00', ordem: 2, is_sistema: true },
    { id: 'a', nome: 'RASCUNHO', rotulo: 'Rascunho custom', cor: '#0f0', ordem: 1, is_sistema: true },
    { id: 'c', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#00f', ordem: 3, is_sistema: false },
  ]

  it('respeita ordem, rótulo e cor da config para status com contagem > 0', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'RASCUNHO', count: 5 },
      { status: 'EM_COTACAO', count: 3 },
    ])
    expect(etapas).toEqual([
      { codigo_status: 'RASCUNHO', rotulo: 'Rascunho custom', quantidade: 5, cor: '#0f0' },
      { codigo_status: 'EM_COTACAO', rotulo: 'Em cotação custom', quantidade: 3, cor: '#f00' },
    ])
  })

  it('omite status com contagem zero', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'APROVADA', count: 0 },
      { status: 'RASCUNHO', count: 2 },
    ])
    expect(etapas).toHaveLength(1)
    expect(etapas[0]?.codigo_status).toBe('RASCUNHO')
  })

  it('inclui status da API ausente na config com fallback de rótulo', () => {
    const etapas = montarEtapasFunilInsightsBidFreteInternacional(config, [
      { status: 'CANCELADA', count: 4 },
    ])
    expect(etapas).toEqual([
      { codigo_status: 'CANCELADA', rotulo: 'Cancelada', quantidade: 4, cor: '#94a3b8' },
    ])
  })
})
