/**
 * ⚠️ ARQUIVO TEMPORÁRIO — DELETAR quando a tela estiver definida.
 *
 * Dados mock para visualizar o dashboard fornecedor (bfd-dashboard) sem API.
 * Remover este arquivo, a flag e o branch em visao-fornecedor-bid-frete-internacional-dashboard.tsx.
 */

import type { DashboardVisaoFornecedorBidFreteInternacional } from './api'
import type { Fornecedor } from './types'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from './rotas-bid-frete-internacional'

/** Desligar ou apagar arquivo antes do commit definitivo da tela. */
export const USAR_MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP = true

const FORNECEDOR_MOCK = {
  id_fornecedor_bid_frete_internacional: 'mock-forn-dashboard-temp',
  id_organizacao: 'mock-org-temp',
  nome_fornecedor_bid_frete_internacional: 'Ocean Link Logistics',
  nome_fantasia_fornecedor_bid_frete_internacional: 'Ocean Link',
  tipo_fornecedor_bid_frete_internacional: 'AGENTE_CARGA',
  status_fornecedor_bid_frete_internacional: 'ATIVO',
  cnpj_fornecedor_bid_frete_internacional: null,
  email_fornecedor_bid_frete_internacional: 'demo@oceanlink.example',
  telefone_fornecedor_bid_frete_internacional: null,
  whatsapp_fornecedor_bid_frete_internacional: null,
  website_fornecedor_bid_frete_internacional: null,
  pais_fornecedor_bid_frete_internacional: 'BR',
  cidade_fornecedor_bid_frete_internacional: 'Santos',
  aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
  cotacao_automatica_fornecedor_bid_frete_internacional: false,
  nota_global_classificacao_bid_frete_internacional: 4.2,
  data_criacao_fornecedor_bid_frete_internacional: '2025-01-15T10:00:00.000Z',
  data_atualizacao_fornecedor_bid_frete_internacional: '2026-05-20T14:30:00.000Z',
} as Fornecedor

export const MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP: DashboardVisaoFornecedorBidFreteInternacional = {
  fornecedor: FORNECEDOR_MOCK,
  metricas: {
    cotacoes_pendentes_visao_fornecedor_bid_frete_internacional: 5,
    propostas_enviadas_visao_fornecedor_bid_frete_internacional: 24,
    propostas_aprovadas_visao_fornecedor_bid_frete_internacional: 8,
    propostas_em_analise_visao_fornecedor_bid_frete_internacional: 11,
    propostas_reprovadas_visao_fornecedor_bid_frete_internacional: 5,
    disparos_recebidos_visao_fornecedor_bid_frete_internacional: 29,
    taxa_resposta_visao_fornecedor_bid_frete_internacional: '82.8',
    taxa_aprovacao_visao_fornecedor_bid_frete_internacional: '33.3',
  },
  kpis: {
    pendentes: 5,
    propostas_enviadas: 24,
    propostas_aprovadas: 8,
    propostas_em_analise: 11,
    propostas_reprovadas: 5,
    disparos_recebidos: 29,
    taxa_resposta: 82.8,
    taxa_aprovacao: 33.3,
    nota_global_classificacao_bid_frete_internacional: 4.2,
  },
  funil: [
    { rotulo: 'aguardando_resposta', quantidade: 5, cor: '#fbbf24' },
    { rotulo: 'em_analise', quantidade: 11, cor: '#818cf8' },
    { rotulo: 'aprovadas', quantidade: 8, cor: '#34d399' },
    { rotulo: 'reprovadas', quantidade: 5, cor: '#f87171' },
  ],
  alertas: [
    {
      rotulo: 'cotacoes_pendentes',
      quantidade: 5,
      tom: 'amber',
      rota: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes,
    },
    {
      rotulo: 'propostas_em_analise',
      quantidade: 11,
      tom: 'blue',
      rota: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    },
    {
      rotulo: 'propostas_reprovadas',
      quantidade: 5,
      tom: 'rose',
      rota: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    },
    {
      rotulo: 'propostas_aprovadas',
      quantidade: 8,
      tom: 'emerald',
      rota: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    },
  ],
}
