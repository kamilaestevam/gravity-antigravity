import { describe, expect, it } from 'vitest'
import {
  montarLinhasPaiLista,
  isLinhaBidGrupo,
  propostasFilhasDaCotacaoAvulsa,
  cotacaoPrestesAExpirar,
  linhaPaiPrestesAExpirar,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/pages/lista-bid-frete-internacional-utils'
import { HORAS_LIMITE_DESTAQUE_EXPIRACAO } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/tabela-config-bid-frete'
import type { BidFreteInternacional, Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'
import {
  agregarResumoBidFreteInternacional,
  gerarNumeroBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/agregar-resumo-bid-frete-internacional.ts'

function cotacaoBase(partial: Partial<Cotacao> & Pick<Cotacao, 'id_cotacao_bid_frete_internacional' | 'numero_cotacao_bid_frete_internacional'>): Cotacao {
  return {
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
    id_bid_bid_frete_internacional: null,
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

function bidBase(partial: Partial<BidFreteInternacional> & Pick<BidFreteInternacional, 'id_bid_bid_frete_internacional'>): BidFreteInternacional {
  return {
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
    id_workspace: 'ws-1',
    numero_bid_bid_frete_internacional: 'BID-20260528-0001',
    referencia_interna_bid_bid_frete_internacional: 'IMP-2026/01',
    status_bid_bid_frete_internacional: 'EM_ANDAMENTO',
    data_criacao_bid_bid_frete_internacional: '2026-05-28T09:00:00.000Z',
    data_atualizacao_bid_bid_frete_internacional: '2026-05-28T09:00:00.000Z',
    cotacoes: [],
    ...partial,
  }
}

describe('montarLinhasPaiLista', () => {
  it('mantém cotação avulsa como linha plana', () => {
    const linhas = montarLinhasPaiLista([], [
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1', numero_cotacao_bid_frete_internacional: 'COT-1' }),
    ])
    expect(linhas).toHaveLength(1)
    expect(isLinhaBidGrupo(linhas[0])).toBe(false)
  })

  it('monta linha BID a partir da entidade bid_frete_internacional', () => {
    const linhas = montarLinhasPaiLista([
      bidBase({
        id_bid_bid_frete_internacional: 'bid-1',
        cotacoes: [
          cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1', numero_cotacao_bid_frete_internacional: 'COT-1', id_bid_bid_frete_internacional: 'bid-1' }),
          cotacaoBase({ id_cotacao_bid_frete_internacional: 'c2', numero_cotacao_bid_frete_internacional: 'COT-2', id_bid_bid_frete_internacional: 'bid-1' }),
        ],
      }),
    ], [])
    expect(linhas).toHaveLength(1)
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhas[0].quantidade_cotacoes).toBe(2)
      expect(linhas[0].id_bid_bid_frete_internacional).toBe('bid-1')
    }
  })

  it('cotação avulsa expande propostas', () => {
    const avulsa = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c1',
      numero_cotacao_bid_frete_internacional: 'COT-1',
      propostas_bid_frete_internacional: [{
        id_proposta_bid_frete_internacional: 'p1',
        id_organizacao: 'org-1',
        id_cotacao_bid_frete_internacional: 'c1',
        id_fornecedor_bid_frete_internacional: 'f1',
        id_disparo_cotacao_bid_frete_internacional: 'd1',
        moeda_proposta_bid_frete_internacional: 'USD',
        valor_frete_proposta_bid_frete_internacional: 1000,
        taxas_origem_proposta_bid_frete_internacional: 0,
        taxas_destino_proposta_bid_frete_internacional: 0,
        valor_total_proposta_bid_frete_internacional: 1000,
        dias_transito_proposta_bid_frete_internacional: 20,
        dias_free_time_proposta_bid_frete_internacional: null,
        quantidade_transbordo_proposta_bid_frete_internacional: 0,
        quantidade_escala_proposta_bid_frete_internacional: 0,
        validade_proposta_bid_frete_internacional: '2026-06-01',
        observacoes_proposta_bid_frete_internacional: null,
        status_proposta_bid_frete_internacional: 'RECEBIDA',
        data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
        data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
      }],
    })
    expect(propostasFilhasDaCotacaoAvulsa(avulsa)).toHaveLength(1)
  })
})

describe('agregarResumoBidFreteInternacional', () => {
  it('agrega modais e rotas distintas das cotações filhas', () => {
    const resumo = agregarResumoBidFreteInternacional([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'COT-1',
        modal_cotacao_bid_frete_internacional: 'MARITIMO',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'COT-2',
        modal_cotacao_bid_frete_internacional: 'AEREO',
        destino_codigo_cotacao_bid_frete_internacional: 'USLAX',
        destino_nome_cotacao_bid_frete_internacional: 'Los Angeles',
        destino_pais_cotacao_bid_frete_internacional: 'US',
      }),
    ])
    expect(resumo.modais_bid_bid_frete_internacional).toEqual(['MARITIMO', 'AEREO'])
    expect(resumo.origens_bid_bid_frete_internacional).toHaveLength(1)
    expect(resumo.destinos_bid_bid_frete_internacional).toHaveLength(2)
    expect(resumo.tipo_operacao_bid_bid_frete_internacional).toBe('IMPORTACAO')
    expect(resumo.modalidade_bid_bid_frete_internacional).toBe('FCL')
  })

  it('retorna null para tipo/modalidade quando filhas divergem', () => {
    const resumo = agregarResumoBidFreteInternacional([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'COT-1',
        tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
        modalidade_cotacao_bid_frete_internacional: 'FCL',
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'COT-2',
        tipo_operacao_cotacao_bid_frete_internacional: 'EXPORTACAO',
        modalidade_cotacao_bid_frete_internacional: 'LCL',
      }),
    ])
    expect(resumo.tipo_operacao_bid_bid_frete_internacional).toBeNull()
    expect(resumo.modalidade_bid_bid_frete_internacional).toBeNull()
  })
})

describe('gerarNumeroBidFreteInternacional', () => {
  it('gera número no formato BID-YYYYMMDD-NNNN', () => {
    expect(gerarNumeroBidFreteInternacional()).toMatch(/^BID-\d{8}-\d{4}$/)
  })
})

describe('cotacaoPrestesAExpirar', () => {
  const agora = new Date('2026-05-28T12:00:00.000Z').getTime()

  it('grupo BID destaca se alguma filha está prestes a expirar', () => {
    const linhas = montarLinhasPaiLista([
      bidBase({
        id_bid_bid_frete_internacional: 'bid-1',
        cotacoes: [
          cotacaoBase({
            id_cotacao_bid_frete_internacional: 'c1',
            numero_cotacao_bid_frete_internacional: 'COT-1',
            status_cotacao_bid_frete_internacional: 'EM_COTACAO',
            data_limite_resposta_cotacao_bid_frete_internacional: '2026-05-28T13:00:00.000Z',
          }),
          cotacaoBase({
            id_cotacao_bid_frete_internacional: 'c2',
            numero_cotacao_bid_frete_internacional: 'COT-2',
            status_cotacao_bid_frete_internacional: 'RASCUNHO',
          }),
        ],
      }),
    ], [])
    expect(isLinhaBidGrupo(linhas[0])).toBe(true)
    if (isLinhaBidGrupo(linhas[0])) {
      expect(linhaPaiPrestesAExpirar(linhas[0], HORAS_LIMITE_DESTAQUE_EXPIRACAO, agora)).toBe(true)
    }
  })
})
