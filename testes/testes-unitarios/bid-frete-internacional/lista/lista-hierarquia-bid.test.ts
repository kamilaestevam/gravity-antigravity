import { describe, expect, it } from 'vitest'
import {
  montarLinhasPaiLista,
  isLinhaBidGrupo,
  cotacaoPrestesAExpirar,
  linhaPaiPrestesAExpirar,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/pages/lista-bid-frete-internacional-utils'
import { HORAS_LIMITE_DESTAQUE_EXPIRACAO } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/tabela-config-bid-frete'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function cotacaoBase(partial: Partial<Cotacao> & Pick<Cotacao, 'id_cotacao_bid_frete_internacional' | 'numero_cotacao_bid_frete_internacional'>): Cotacao {
  return {
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
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

describe('montarLinhasPaiLista', () => {
  it('mantém cotação avulsa como linha plana', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1', numero_cotacao_bid_frete_internacional: 'BID-1' }),
    ])
    expect(linhas).toHaveLength(1)
    expect(isLinhaBidGrupo(linhas[0])).toBe(false)
  })

  it('agrupa 2+ cotações com mesma referência interna em linha BID', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'BID-1',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-2026/01',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'BID-2',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-2026/01',
      }),
    ])
    expect(linhas).toHaveLength(1)
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhas[0].quantidade_cotacoes).toBe(2)
      expect(linhas[0].cotacoes).toHaveLength(2)
    }
  })

  it('referência única permanece linha avulsa', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'BID-1',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-UNICA',
      }),
    ])
    expect(isLinhaBidGrupo(linhas[0])).toBe(false)
  })

  it('linha BID agrega id_organizacao e campos idênticos de usuário/workspace', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'BID-1',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-GRP',
        id_organizacao: 'org-abc',
        id_usuario: 'user-1',
        id_workspace: 'ws-1',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'BID-2',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-GRP',
        id_organizacao: 'org-abc',
        id_usuario: 'user-1',
        id_workspace: 'ws-1',
      }),
    ])
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhas[0].id_organizacao).toBe('org-abc')
      expect(linhas[0].id_usuario).toBe('user-1')
      expect(linhas[0].id_workspace).toBe('ws-1')
      expect(linhas[0].usuarios_divergentes).toBe(false)
      expect(linhas[0].workspaces_divergentes).toBe(false)
    }
  })

  it('linha BID marca divergência quando usuários ou workspaces diferem', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'BID-1',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-MIX',
        id_usuario: 'user-1',
        id_workspace: 'ws-1',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'BID-2',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-MIX',
        id_usuario: 'user-2',
        id_workspace: 'ws-2',
      }),
    ])
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhas[0].id_usuario).toBeNull()
      expect(linhas[0].id_workspace).toBeNull()
      expect(linhas[0].usuarios_divergentes).toBe(true)
      expect(linhas[0].workspaces_divergentes).toBe(true)
      expect(linhas[0].quantidade_usuarios_distintos).toBe(2)
      expect(linhas[0].quantidade_workspaces_distintos).toBe(2)
    }
  })
})

describe('cotacaoPrestesAExpirar', () => {
  const agora = new Date('2026-05-28T12:00:00.000Z').getTime()

  it('destaca cotação com prazo em até 2 horas', () => {
    const cotacao = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-exp',
      numero_cotacao_bid_frete_internacional: 'BID-EXP',
      status_cotacao_bid_frete_internacional: 'EM_COTACAO',
      data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-28T13:30:00.000Z',
    })
    expect(cotacaoPrestesAExpirar(cotacao, HORAS_LIMITE_DESTAQUE_EXPIRACAO, agora)).toBe(true)
  })

  it('não destaca cotação já expirada no status', () => {
    const cotacao = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-done',
      numero_cotacao_bid_frete_internacional: 'BID-DONE',
      status_cotacao_bid_frete_internacional: 'EXPIRADA',
      data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-28T13:00:00.000Z',
    })
    expect(cotacaoPrestesAExpirar(cotacao, HORAS_LIMITE_DESTAQUE_EXPIRACAO, agora)).toBe(false)
  })

  it('não destaca quando faltam mais de 2 horas', () => {
    const cotacao = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-ok',
      numero_cotacao_bid_frete_internacional: 'BID-OK',
      status_cotacao_bid_frete_internacional: 'EM_COTACAO',
      data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-29T12:00:00.000Z',
    })
    expect(cotacaoPrestesAExpirar(cotacao, HORAS_LIMITE_DESTAQUE_EXPIRACAO, agora)).toBe(false)
  })

  it('grupo BID destaca se alguma filha está prestes a expirar', () => {
    const linhas = montarLinhasPaiLista([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'BID-1',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-GRP',
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-28T13:00:00.000Z',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'BID-2',
        referencia_interna_cotacao_bid_frete_internacional: 'IMP-GRP',
        status_cotacao_bid_frete_internacional: 'RASCUNHO',
        data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-30T12:00:00.000Z',
      }),
    ])
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhaPaiPrestesAExpirar(linhas[0], HORAS_LIMITE_DESTAQUE_EXPIRACAO, agora)).toBe(true)
    }
  })
})
