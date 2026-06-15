import { describe, expect, it } from 'vitest'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'
import { buildColunasCotacoes } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/pages/colunas-lista-bid-frete-internacional'
import {
  cotacaoPassaFiltrosColuna,
  deveUsarFiltroTextoLivreBidFrete,
  mapColunaUsuarioBidFreteParaGTColuna,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/filtros-coluna-lista-bid-frete-internacional'

function cotacaoBase(partial: Partial<Cotacao> = {}): Cotacao {
  return {
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
    id_workspace: 'ws-1',
    id_produto_gravity: 'bid-frete-internacional',
    numero_cotacao_bid_frete_internacional: 'BID-20260528-0001',
    referencia_interna_cotacao_bid_frete_internacional: null,
    tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: 'FCL',
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    origem_nome_cotacao_bid_frete_internacional: 'Santos',
    origem_pais_cotacao_bid_frete_internacional: 'BR',
    destino_codigo_cotacao_bid_frete_internacional: 'CNSHA',
    destino_nome_cotacao_bid_frete_internacional: 'Shanghai',
    destino_pais_cotacao_bid_frete_internacional: 'CN',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Carga teste',
    ncm_cotacao_bid_frete_internacional: null,
    quantidade_cotacao_bid_frete_internacional: 1,
    tipo_container_cotacao_bid_frete_internacional: null,
    peso_kg_cotacao_bid_frete_internacional: null,
    cubagem_m3_cotacao_bid_frete_internacional: null,
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    zipcode_destino_cotacao_bid_frete_internacional: null,
    visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
    anonima_cotacao_bid_frete_internacional: false,
    valor_meta_cotacao_bid_frete_internacional: null,
    moeda_meta_cotacao_bid_frete_internacional: 'USD',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    ganho_valor_cotacao_bid_frete_internacional: null,
    ganho_percentual_cotacao_bid_frete_internacional: null,
    data_criacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    data_atualizacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    ...partial,
  }
}

describe('filtros-coluna-lista-bid-frete-internacional', () => {
  it('mapColunaUsuarioBidFreteParaGTColuna marca filtravel', () => {
    const col = mapColunaUsuarioBidFreteParaGTColuna({
      id: 'col-custom',
      chave: 'campo_custom',
      nome: 'Campo custom',
      tipo: 'texto',
    })
    expect(col.filtravel).toBe(true)
  })

  it('deveUsarFiltroTextoLivreBidFrete para número da cotação', () => {
    const colunas = buildColunasCotacoes(null)
    const col = colunas.find(
      c => c.key === 'numero_cotacao_bid_frete_internacional',
    )
    expect(col).toBeDefined()
    expect(deveUsarFiltroTextoLivreBidFrete(col!)).toBe(true)
  })

  it('cotacaoPassaFiltrosColuna filtra coluna manual via _colunas_usuario', () => {
    const colManual = mapColunaUsuarioBidFreteParaGTColuna({
      id: 'col_lider',
      chave: 'lider',
      nome: 'Líder',
      tipo: 'texto',
    })
    const map = new Map([[String(colManual.key), colManual]])
    const colunasPorChave = new Map([
      ['lider', { id: 'col_lider', chave: 'lider', nome: 'Líder', tipo: 'texto' }],
    ])
    const cotacao = cotacaoBase({
      _colunas_usuario: { col_lider: 'Ana' },
    })
    const passa = cotacaoPassaFiltrosColuna(
      cotacao,
      { lider: { tipo: 'texto', valor: 'Ana' } },
      map,
      {},
      {},
      colunasPorChave,
    )
    const falha = cotacaoPassaFiltrosColuna(
      cotacao,
      { lider: { tipo: 'texto', valor: 'Bob' } },
      map,
      {},
      {},
      colunasPorChave,
    )
    expect(passa).toBe(true)
    expect(falha).toBe(false)
  })

  it('cotacaoPassaFiltrosColuna filtra por texto no número da cotação', () => {
    const colunas = buildColunasCotacoes(null)
    const map = new Map(colunas.map(c => [String(c.key), c]))
    const cotacao = cotacaoBase()
    const passa = cotacaoPassaFiltrosColuna(
      cotacao,
      {
        numero_cotacao_bid_frete_internacional: { tipo: 'texto', valor: '20260528' },
      },
      map,
      {},
    )
    const falha = cotacaoPassaFiltrosColuna(
      cotacao,
      {
        numero_cotacao_bid_frete_internacional: { tipo: 'texto', valor: '9999' },
      },
      map,
      {},
    )
    expect(passa).toBe(true)
    expect(falha).toBe(false)
  })
})
