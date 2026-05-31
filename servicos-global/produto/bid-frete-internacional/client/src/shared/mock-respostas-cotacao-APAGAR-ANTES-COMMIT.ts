/**
 * ⚠️ ARQUIVO TEMPORÁRIO — DELETAR ANTES DO COMMIT
 *
 * Injeta 10 respostas mockadas para testar pódio (top 3) + lista expandida (4º+).
 * Remover este arquivo e o import/flag em cotacao-detalhe.tsx antes de commitar.
 */

import type { Cotacao, Fornecedor, PropostaBidFreteInternacional } from './types'
import { ranquearPropostasLocal } from './metricas-proposta-cotacao-bid-frete-internacional'

/** Flag única — desligar ou apagar arquivo antes do commit. */
export const MOCAR_RESPOSTAS_COTACAO_TEMP = true

interface MockFornecedorResposta {
  id: string
  nome: string
  moeda?: string
  frete: number
  taxasOrigem: number
  taxasDestino: number
  diasTransito: number
  diasFreeTime: number
  transbordos: number
  diasPrazoPagamento?: number | null
}

const MOCKS_EXTRA: MockFornecedorResposta[] = [
  {
    id: 'mock-forn-temp-msc',
    nome: 'MSC BRASIL LOGISTICS',
    frete: 620,
    taxasOrigem: 95,
    taxasDestino: 110,
    diasTransito: 28,
    diasFreeTime: 10,
    transbordos: 1,
    diasPrazoPagamento: 30,
  },
  {
    id: 'mock-forn-temp-cma',
    nome: 'CMA CGM LATAM',
    frete: 580,
    taxasOrigem: 88,
    taxasDestino: 102,
    diasTransito: 22,
    diasFreeTime: 14,
    transbordos: 0,
    diasPrazoPagamento: 45,
  },
  {
    id: 'mock-forn-temp-hapag',
    nome: 'HAPAG-LLOYD BRASIL',
    frete: 780,
    taxasOrigem: 120,
    taxasDestino: 135,
    diasTransito: 35,
    diasFreeTime: 7,
    transbordos: 2,
    diasPrazoPagamento: 60,
  },
  {
    id: 'mock-forn-temp-one',
    nome: 'ONE OCEAN NETWORK',
    frete: 540,
    taxasOrigem: 75,
    taxasDestino: 90,
    diasTransito: 19,
    diasFreeTime: 12,
    transbordos: 0,
    diasPrazoPagamento: 30,
  },
  {
    id: 'mock-forn-temp-maersk',
    nome: 'MAERSK LINE BRASIL',
    frete: 695,
    taxasOrigem: 105,
    taxasDestino: 118,
    diasTransito: 25,
    diasFreeTime: 10,
    transbordos: 1,
    diasPrazoPagamento: 45,
  },
  {
    id: 'mock-forn-temp-cosco',
    nome: 'COSCO SHIPPING LATAM',
    moeda: 'USD',
    frete: 510,
    taxasOrigem: 72,
    taxasDestino: 85,
    diasTransito: 24,
    diasFreeTime: 11,
    transbordos: 1,
    diasPrazoPagamento: 30,
  },
  {
    id: 'mock-forn-temp-evergreen',
    nome: 'EVERGREEN MARINE',
    frete: 650,
    taxasOrigem: 98,
    taxasDestino: 112,
    diasTransito: 27,
    diasFreeTime: 9,
    transbordos: 1,
    diasPrazoPagamento: 45,
  },
  {
    id: 'mock-forn-temp-zim',
    nome: 'ZIM INTEGRATED',
    moeda: 'USD',
    frete: 495,
    taxasOrigem: 68,
    taxasDestino: 82,
    diasTransito: 21,
    diasFreeTime: 14,
    transbordos: 0,
    diasPrazoPagamento: 30,
  },
  {
    id: 'mock-forn-temp-pil',
    nome: 'PIL PACIFIC INT. LINE',
    frete: 720,
    taxasOrigem: 115,
    taxasDestino: 128,
    diasTransito: 32,
    diasFreeTime: 8,
    transbordos: 2,
    diasPrazoPagamento: 60,
  },
  {
    id: 'mock-forn-temp-yangming',
    nome: 'YANG MING SHIPPING',
    moeda: 'EUR',
    frete: 560,
    taxasOrigem: 82,
    taxasDestino: 96,
    diasTransito: 23,
    diasFreeTime: 12,
    transbordos: 0,
    diasPrazoPagamento: 45,
  },
]

function criarFornecedorMock(mock: MockFornecedorResposta, idOrganizacao: string): Fornecedor {
  const agora = new Date().toISOString()
  return {
    id_fornecedor_bid_frete_internacional: mock.id,
    id_organizacao: idOrganizacao,
    nome_fornecedor_bid_frete_internacional: mock.nome,
    nome_fantasia_fornecedor_bid_frete_internacional: null,
    tipo_fornecedor_bid_frete_internacional: 'ARMADOR',
    status_fornecedor_bid_frete_internacional: 'ATIVO',
    cnpj_fornecedor_bid_frete_internacional: null,
    email_fornecedor_bid_frete_internacional: 'mock-temp@example.com',
    telefone_fornecedor_bid_frete_internacional: null,
    whatsapp_fornecedor_bid_frete_internacional: null,
    website_fornecedor_bid_frete_internacional: null,
    pais_fornecedor_bid_frete_internacional: 'BR',
    cidade_fornecedor_bid_frete_internacional: null,
    aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    cotacao_automatica_fornecedor_bid_frete_internacional: false,
    data_criacao_fornecedor_bid_frete_internacional: agora,
    data_atualizacao_fornecedor_bid_frete_internacional: agora,
  }
}

function criarPropostaMock(
  mock: MockFornecedorResposta,
  indice: number,
  cot: Cotacao,
  ref: PropostaBidFreteInternacional | undefined,
): PropostaBidFreteInternacional {
  const agora = new Date().toISOString()
  const moeda = mock.moeda
    ?? ref?.moeda_proposta_bid_frete_internacional
    ?? cot.moeda_meta_cotacao_bid_frete_internacional
    ?? 'USD'
  const total = mock.frete + mock.taxasOrigem + mock.taxasDestino
  const idOrganizacao = ref?.id_organizacao ?? cot.id_organizacao

  return {
    id_proposta_bid_frete_internacional: `mock-resposta-temp-${indice + 1}`,
    id_cotacao_bid_frete_internacional: cot.id_cotacao_bid_frete_internacional,
    id_bid_bid_frete_internacional: ref?.id_bid_bid_frete_internacional ?? null,
    id_organizacao: idOrganizacao,
    id_workspace: ref?.id_workspace ?? cot.id_workspace ?? null,
    id_fornecedor_bid_frete_internacional: mock.id,
    fornecedor: criarFornecedorMock(mock, idOrganizacao),
    id_disparo_cotacao_bid_frete_internacional: `mock-disparo-temp-${indice + 1}`,
    moeda_proposta_bid_frete_internacional: moeda,
    valor_frete_proposta_bid_frete_internacional: mock.frete,
    taxas_origem_proposta_bid_frete_internacional: mock.taxasOrigem,
    taxas_destino_proposta_bid_frete_internacional: mock.taxasDestino,
    valor_total_proposta_bid_frete_internacional: total,
    dias_transito_proposta_bid_frete_internacional: mock.diasTransito,
    dias_free_time_proposta_bid_frete_internacional: mock.diasFreeTime,
    quantidade_transbordo_proposta_bid_frete_internacional: mock.transbordos,
    quantidade_escala_proposta_bid_frete_internacional: mock.transbordos,
    dias_prazo_pagamento_proposta_bid_frete_internacional: mock.diasPrazoPagamento ?? null,
    validade_proposta_bid_frete_internacional: '2026-06-30T00:00:00.000Z',
    observacoes_proposta_bid_frete_internacional: null,
    status_proposta_bid_frete_internacional: 'ENVIADA',
    data_criacao_proposta_bid_frete_internacional: agora,
    data_atualizacao_proposta_bid_frete_internacional: agora,
  }
}

export function anexarMocksRespostasTemporarias<T extends PropostaBidFreteInternacional>(
  propostas: T[],
  cot: Cotacao,
): ReturnType<typeof ranquearPropostasLocal> {
  if (!MOCAR_RESPOSTAS_COTACAO_TEMP) {
    return propostas as ReturnType<typeof ranquearPropostasLocal>
  }

  const ref = propostas[0] ?? cot.propostas_bid_frete_internacional?.[0]
  const extras = MOCKS_EXTRA.map((mock, indice) => criarPropostaMock(mock, indice, cot, ref))

  const mescladas = [...propostas, ...extras] as PropostaBidFreteInternacional[]
  return ranquearPropostasLocal(mescladas)
}
