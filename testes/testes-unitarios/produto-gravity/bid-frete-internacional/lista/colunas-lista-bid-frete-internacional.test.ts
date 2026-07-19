import { describe, expect, it } from 'vitest'
import {
  CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA,
  ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/ordem-colunas-lista-bid-frete-internacional'
import {
  CAMPOS_EDITAVEIS_LISTA,
  CAMPOS_NAO_EDITAVEIS_LISTA,
  CHAVES_COLUNAS_COTACAO,
  CHAVES_COLUNAS_PADRAO_VISIVEIS,
  buildColunasCotacoes,
  buildMapaColunasFilho,
  formatValorExportColuna,
  type OpcoesColunasLista,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/pages/colunas-lista-bid-frete-internacional'
import type { Cotacao } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

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
    quantidade_volume_cotacao_bid_frete_internacional: 1,
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

  it('CHAVES_COLUNAS_PADRAO_VISIVEIS oculta colunas técnicas (ID, Produto, Usuário)', () => {
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).not.toContain('id_cotacao_bid_frete_internacional')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).not.toContain('id_produto_gravity')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).not.toContain('id_usuario')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('numero_cotacao_bid_frete_internacional')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('id_organizacao')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('id_workspace')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toHaveLength(45)
  })

  it('CHAVES_COLUNAS_COTACAO segue ordem canônica da lista (45 exibidas + 3 ocultas técnicas)', () => {
    expect(CHAVES_COLUNAS_COTACAO).toEqual(ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL)
    expect(CHAVES_COLUNAS_COTACAO).toHaveLength(48)
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toEqual(CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA)
  })

  it('colunas de frete e taxas da proposta aparecem por padrão após Valor meta', () => {
    const keys = CHAVES_COLUNAS_PADRAO_VISIVEIS
    expect(keys).toContain('valor_frete_proposta_bid_frete_internacional')
    expect(keys).toContain('taxas_origem_proposta_bid_frete_internacional')
    expect(keys).toContain('taxas_destino_proposta_bid_frete_internacional')
    expect(keys).toContain('valor_total_proposta_bid_frete_internacional')
    expect(keys.indexOf('valor_meta_cotacao_bid_frete_internacional')).toBeLessThan(
      keys.indexOf('valor_frete_proposta_bid_frete_internacional'),
    )
    expect(keys.indexOf('taxas_destino_proposta_bid_frete_internacional')).toBeLessThan(
      keys.indexOf('valor_total_proposta_bid_frete_internacional'),
    )
  })

  it('rótulos das colunas monetárias da proposta na lista', () => {
    const colunas = buildColunasCotacoes(null)
    expect(colunas.find(c => c.key === 'valor_frete_proposta_bid_frete_internacional')?.label).toBe('Frete base')
    expect(colunas.find(c => c.key === 'taxas_origem_proposta_bid_frete_internacional')?.label).toBe('Taxas de Origem')
    expect(colunas.find(c => c.key === 'taxas_destino_proposta_bid_frete_internacional')?.label).toBe('Taxas de Destino')
    expect(colunas.find(c => c.key === 'valor_total_proposta_bid_frete_internacional')?.label).toBe('Valor do Frete Total')
  })

  it('ordem padrão visível: Status e Operação após Nº da cotação; Porto destino antes de origem', () => {
    const keys = CHAVES_COLUNAS_PADRAO_VISIVEIS
    expect(keys.indexOf('status_cotacao_bid_frete_internacional')).toBe(1)
    expect(keys.indexOf('tipo_operacao_cotacao_bid_frete_internacional')).toBe(2)
    expect(keys.indexOf('porto_destino_cotacao_bid_frete_internacional')).toBeLessThan(
      keys.indexOf('porto_origem_cotacao_bid_frete_internacional'),
    )
    expect(keys.indexOf('moeda_meta_cotacao_bid_frete_internacional')).toBeLessThan(
      keys.indexOf('valor_meta_cotacao_bid_frete_internacional'),
    )
  })

  it('colunas técnicas estão marcadas como oculta em buildColunasCotacoes', () => {
    const colunas = buildColunasCotacoes(null)
    expect(colunas.find(c => c.key === 'id_cotacao_bid_frete_internacional')?.oculta).toBe(true)
    expect(colunas.find(c => c.key === 'id_produto_gravity')?.oculta).toBe(true)
    expect(colunas.find(c => c.key === 'id_usuario')?.oculta).toBe(true)
  })

  it('coluna id_produto_gravity exibe label Produto Gravity', () => {
    const colunas = buildColunasCotacoes(null)
    const colProduto = colunas.find(c => c.key === 'id_produto_gravity')
    expect(colProduto?.label).toBe('Produto Gravity')
  })

  it('coluna referencia_interna exibe label Referência Interna', () => {
    const colunas = buildColunasCotacoes(null)
    const colRef = colunas.find(c => c.key === 'referencia_interna_cotacao_bid_frete_internacional')
    expect(colRef?.label).toBe('Referência Interna')
  })

  it('buildColunasCotacoes centraliza align em todas as colunas (TASK-000268)', () => {
    const colunas = buildColunasCotacoes(null)
    expect(colunas.length).toBeGreaterThan(0)
    for (const col of colunas) {
      expect(col.align, `coluna ${col.key}`).toBe('center')
    }
  })

  it('colunas rota destino: endereco e pais apos destino nome (ordem padrao lista)', () => {
    const colunas = buildColunasCotacoes(null)
    const keys = colunas.map(c => c.key)
    const idxDestino = keys.indexOf('destino_nome_cotacao_bid_frete_internacional')
    const idxEndereco = keys.indexOf('endereco_destino_cotacao_bid_frete_internacional')
    const idxPais = keys.indexOf('destino_pais_cotacao_bid_frete_internacional')
    expect(idxEndereco).toBe(idxDestino + 1)
    expect(idxPais).toBe(idxEndereco + 1)
  })

  it('CHAVES_COLUNAS_PADRAO_VISIVEIS inclui pais e endereco destino', () => {
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('destino_pais_cotacao_bid_frete_internacional')
    expect(CHAVES_COLUNAS_PADRAO_VISIVEIS).toContain('endereco_destino_cotacao_bid_frete_internacional')
  })
})

describe('CAMPOS_EDITAVEIS_LISTA — edição inline', () => {
  it('inclui todas as colunas exceto campos técnicos', () => {
    const esperados = CHAVES_COLUNAS_COTACAO.filter(k => !CAMPOS_NAO_EDITAVEIS_LISTA.has(k))
    expect(CAMPOS_EDITAVEIS_LISTA).toEqual(esperados)
  })

  it('colunas visíveis da lista (status, operação, modal, workspace) são editáveis', () => {
    for (const key of [
      'numero_cotacao_bid_frete_internacional',
      'referencia_interna_cotacao_bid_frete_internacional',
      'tipo_operacao_cotacao_bid_frete_internacional',
      'status_cotacao_bid_frete_internacional',
      'visibilidade_cotacao_bid_frete_internacional',
      'anonima_cotacao_bid_frete_internacional',
      'id_workspace',
      'data_limite_resposta_cotacao_bid_frete_internacional',
      'id_organizacao',
      'modal_cotacao_bid_frete_internacional',
      'modalidade_cotacao_bid_frete_internacional',
      'origem_nome_cotacao_bid_frete_internacional',
      'destino_nome_cotacao_bid_frete_internacional',
      'quantidade_volume_cotacao_bid_frete_internacional',
      'tipo_container_cotacao_bid_frete_internacional',
    ]) {
      expect(CAMPOS_EDITAVEIS_LISTA).toContain(key)
    }
  })

  it('buildColunasCotacoes marca enums com opcoes de edição', () => {
    const colunas = buildColunasCotacoes(null, {
      statusOpcoes: [{ valor: 'RASCUNHO', label: 'Rascunho' }],
    })
    expect(colunas.find(c => c.key === 'status_cotacao_bid_frete_internacional')?.opcoes).toHaveLength(1)
    expect(colunas.find(c => c.key === 'tipo_operacao_cotacao_bid_frete_internacional')?.opcoes?.length).toBeGreaterThan(0)
    expect(colunas.find(c => c.key === 'modal_cotacao_bid_frete_internacional')?.opcoes?.length).toBeGreaterThan(0)
    expect(colunas.find(c => c.key === 'visibilidade_cotacao_bid_frete_internacional')?.opcoes).toHaveLength(2)
  })

  it('coluna Origem é somente leitura na lista (logística via porto/aeroporto)', () => {
    const colunas = buildColunasCotacoes(null, {
      portosOpcoes: [{ valor: 'ARBUE', label: 'ARBUE — Buenos Aires' }],
      aeroportosOpcoes: [{ valor: 'GRU', label: 'GRU — Guarulhos' }],
    })
    const colOrigem = colunas.find(c => c.key === 'origem_nome_cotacao_bid_frete_internacional')
    expect(colOrigem).toBeDefined()
    expect(colOrigem?.opcoes).toBeUndefined()
    expect(typeof colOrigem?.editavel === 'function'
      ? colOrigem.editavel(cotacaoBase())
      : colOrigem?.editavel).toBe(false)
    const colPortoOrigem = colunas.find(c => c.key === 'porto_origem_cotacao_bid_frete_internacional')
    expect(colPortoOrigem?.opcoes).toHaveLength(2)
  })
})

describe('buildMapaColunasFilho — contrato GTMapaColunasFilho (render recebe só item)', () => {
  it('render de origem não quebra ao expandir linha filha (cotacao)', () => {
    const mapa = buildMapaColunasFilho(null, {
      portosOpcoes: [{ valor: 'BRSSZ', label: 'BRSSZ — Santos' }],
    })
    const entrada = mapa.origem_nome_cotacao_bid_frete_internacional
    expect(entrada).toBeDefined()
    expect(() => entrada.render(cotacaoBase())).not.toThrow()
    expect(entrada.getValorEditar).toBeUndefined()
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
