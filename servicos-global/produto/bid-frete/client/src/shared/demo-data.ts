import type { DashboardKPIs, CalendarioAlerta, StatusCotacao } from './types'

export const DEMO_KPIS: DashboardKPIs = {
  cotacoes_andamento: 24,
  cotacoes_passadas: 156,
  valor_andamento_usd: 487320,
  valor_andamento_brl: 2412860,
  valor_aprovado_usd: 1823450,
  valor_aprovado_brl: 9032100,
  aprovacao: { percentual_em_tempo: 78, percentual_atraso: 14, nao_respondidas: 8 },
  savings: { total_saving_usd: 145280, media_saving_percentual: 18.5 },
  funil: [
    { status: 'RASCUNHO' as StatusCotacao, count: 5 },
    { status: 'ENVIADA_FORNECEDORES' as StatusCotacao, count: 8 },
    { status: 'EM_COTACAO' as StatusCotacao, count: 12 },
    { status: 'AGUARDANDO_APROVACAO' as StatusCotacao, count: 7 },
    { status: 'APROVADA' as StatusCotacao, count: 42 },
    { status: 'REPROVADA' as StatusCotacao, count: 6 },
    { status: 'EXPIRADA' as StatusCotacao, count: 3 },
  ],
  fornecedores_cadastrados: 47,
  fornecedores_por_tipo: [
    { tipo: 'AGENTE_CARGA', count: 18 },
    { tipo: 'ARMADOR', count: 12 },
    { tipo: 'CIA_AEREA', count: 9 },
    { tipo: 'TRANSPORTADORA', count: 8 },
  ],
  moedas: [
    { codigo: 'USD', nome: 'Dolar', referencia: true, valor_brl: 5.12, variacao: -0.32 },
    { codigo: 'EUR', nome: 'Euro', referencia: false, valor_brl: 5.68, variacao: 0.15 },
    { codigo: 'CNY', nome: 'Yuan', referencia: false, valor_brl: 0.71, variacao: -0.08 },
  ],
}

export const DEMO_CALENDARIO: CalendarioAlerta[] = [
  { tipo: 'vencimento', label: 'Cotacoes vencem hoje', count: 3, cor: 'red' },
  { tipo: 'resposta', label: 'Respostas pendentes', count: 7, cor: 'orange' },
  { tipo: 'aprovacao', label: 'Aguardando aprovacao', count: 4, cor: 'yellow' },
  { tipo: 'nova', label: 'Novas cotacoes (7 dias)', count: 12, cor: 'green' },
]

export const DEMO_MENSAL = [
  { mes: 'Dez', aprovadas: 18, andamento: 6, recusadas: 3 },
  { mes: 'Jan', aprovadas: 22, andamento: 8, recusadas: 4 },
  { mes: 'Fev', aprovadas: 28, andamento: 5, recusadas: 2 },
  { mes: 'Mar', aprovadas: 32, andamento: 10, recusadas: 5 },
  { mes: 'Abr', aprovadas: 26, andamento: 9, recusadas: 3 },
  { mes: 'Mai', aprovadas: 35, andamento: 12, recusadas: 4 },
]

export const DEMO_MODAL = [
  { modal: 'MARITIMO', count: 48, pct: 52, cor: '#60a5fa' },
  { modal: 'AEREO', count: 31, pct: 34, cor: '#a78bfa' },
  { modal: 'RODOVIARIO', count: 13, pct: 14, cor: '#34d399' },
]

export const DEMO_MELHOR_COTACAO = {
  numero: 'BF-2026-0142',
  origem: 'Shanghai (CNSHA)',
  destino: 'Santos (BRSSZ)',
  modal: 'MARITIMO' as const,
  saving_pct: 23.4,
  saving_valor: 12480,
  valor_aprovado: 40850,
  fornecedor: 'Pacific Cargo Ltda',
  transit_time: 32,
}

export const DEMO_INCOTERMS = [
  { incoterm: 'FOB', count: 38, pct: 76 },
  { incoterm: 'CIF', count: 24, pct: 48 },
  { incoterm: 'EXW', count: 15, pct: 30 },
  { incoterm: 'DDP', count: 8, pct: 16 },
  { incoterm: 'CFR', count: 5, pct: 10 },
]
