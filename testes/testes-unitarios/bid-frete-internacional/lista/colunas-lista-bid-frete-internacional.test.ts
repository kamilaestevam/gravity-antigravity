import { describe, expect, it } from 'vitest'
import {
  CHAVES_COLUNAS_COTACAO,
  CHAVES_COLUNAS_PADRAO_VISIVEIS,
  buildColunasCotacoes,
  formatValorExportColuna,
  type OpcoesColunasLista,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/pages/colunas-lista-bid-frete-internacional'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

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

function opcoesFixture(): OpcoesColunasLista {
  return {
    organizacoesMap: new Map([['org-1', 'Gravity Org']]),
    workspacesMap: new Map([['ws-1', { nome: 'Filial SP' }]]),
    usuariosMap: new Map([['user-1', 'Maria Silva']]),
    idUsuarioAtual: 'user-1',
    nomeUsuarioAtual: 'Maria Silva',
    nomeWorkspaceFallback: 'Filial SP',
  }
}

describe('CHAVES_COLUNAS — visibilidade padrão', () => {
  it('CHAVES_COLUNAS_COTACAO inclui id técnico para validação de prefs', () => {
    expect(CHAVES_COLUNAS_COTACAO).toContain('id_cotacao_bid_frete_internacional')
  })

  it('CHAVES_COLUNAS_PADRAO_VISIVEIS oculta id_cotacao_bid_frete_internacional', () => {
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).not.toContain('id_cotacao_bid_frete_internacional')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('numero_cotacao_bid_frete_internacional')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('id_organizacao')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('id_workspace')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('id_usuario')
  })

  it('coluna ID interna está marcada como oculta em buildColunasCotacoes', () => {
    const colunas = buildColunasCotacoes(null)
    const colId = colunas.find(c => c.key === 'id_cotacao_bid_frete_internacional')
    expect(colId?.oculta).toBe(true)
  })
})

describe('formatValorExportColuna — paridade com exibição', () => {
  const opcoes = opcoesFixture()
  const row = cotacaoBase()

  it('resolve nome da organização', () => {
    expect(formatValorExportColuna('id_organizacao', row, opcoes)).toBe('Gravity Org')
  })

  it('resolve nome do usuário', () => {
    expect(formatValorExportColuna('id_usuario', row, opcoes)).toBe('Maria Silva')
  })

  it('resolve nome do workspace', () => {
    expect(formatValorExportColuna('id_workspace', row, opcoes)).toBe('Filial SP')
  })

  it('resolve label legível do produto', () => {
    expect(formatValorExportColuna('id_produto_gravity', row, opcoes)).toBe('BID Frete Internacional')
  })

  it('usa fallback de workspace só para cotação do usuário logado sem id_workspace', () => {
    const rowSemWs = cotacaoBase({ id_workspace: null })
    expect(formatValorExportColuna('id_workspace', rowSemWs, opcoes)).toBe('Filial SP')
  })

  it('não usa fallback de workspace para cotação de outro usuário', () => {
    const rowOutro = cotacaoBase({ id_workspace: null, id_usuario: 'user-99' })
    expect(formatValorExportColuna('id_workspace', rowOutro, opcoes)).toBe('')
  })

  it('resolve user_dev_default via nomeUsuarioAtual', () => {
    const rowDev = cotacaoBase({ id_usuario: 'user_dev_default' })
    expect(formatValorExportColuna('id_usuario', rowDev, opcoes)).toBe('Maria Silva')
  })
})
