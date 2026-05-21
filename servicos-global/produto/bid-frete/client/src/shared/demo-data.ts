import type { DashboardKPIs, CalendarioAlerta, StatusCotacao } from './types'

export const DEMO_KPIS: DashboardKPIs = {
  cotacoes_andamento: 200, // Aligned with the 200 active quotes scenario
  cotacoes_passadas: 840,
  valor_andamento_usd: 3420000,
  valor_andamento_brl: 17500000,
  valor_aprovado_usd: 18234500,
  valor_aprovado_brl: 93210000,
  aprovacao: { percentual_em_tempo: 78, percentual_atraso: 14, nao_respondidas: 8 },
  savings: { total_saving_usd: 684200, media_saving_percentual: 18.2 }, // Aligned with Left Panel saving avg
  funil: [
    { status: 'RASCUNHO' as StatusCotacao, count: 15 },
    { status: 'ENVIADA_FORNECEDORES' as StatusCotacao, count: 35 },
    { status: 'EM_COTACAO' as StatusCotacao, count: 110 },
    { status: 'AGUARDANDO_APROVACAO' as StatusCotacao, count: 40 },
    { status: 'APROVADA' as StatusCotacao, count: 840 },
    { status: 'REPROVADA' as StatusCotacao, count: 68 },
    { status: 'EXPIRADA' as StatusCotacao, count: 42 },
  ],
  fornecedores_cadastrados: 47,
  fornecedores_por_tipo: [
    { tipo: 'AGENTE_CARGA', count: 18 },
    { tipo: 'ARMADOR', count: 12 },
    { tipo: 'CIA_AEREA', count: 9 },
    { tipo: 'TRANSPORTADORA', count: 8 },
  ],
  moedas: [
    { codigo: 'USD', nome: 'Dólar', referencia: true, valor_brl: 5.12, variacao: -0.32 },
    { codigo: 'EUR', nome: 'Euro', referencia: false, valor_brl: 5.68, variacao: 0.15 },
    { codigo: 'CNY', nome: 'Yuan', referencia: false, valor_brl: 0.71, variacao: -0.08 },
  ],
}

export const DEMO_CALENDARIO: CalendarioAlerta[] = [
  { tipo: 'vencimento', label: 'Cotações vencem hoje', count: 6, cor: 'red' },
  { tipo: 'resposta', label: 'Respostas pendentes', count: 28, cor: 'orange' },
  { tipo: 'aprovacao', label: 'Aguardando aprovação', count: 14, cor: 'yellow' },
  { tipo: 'nova', label: 'Novas cotações (7 dias)', count: 45, cor: 'green' },
]

export const DEMO_MENSAL = [
  { mes: 'Dez', aprovadas: 110, andamento: 30, recusadas: 12 },
  { mes: 'Jan', aprovadas: 135, andamento: 35, recusadas: 15 },
  { mes: 'Fev', aprovadas: 140, andamento: 32, recusadas: 10 },
  { mes: 'Mar', aprovadas: 162, andamento: 45, recusadas: 18 },
  { mes: 'Abr', aprovadas: 148, andamento: 38, recusadas: 11 },
  { mes: 'Mai', aprovadas: 185, andamento: 50, recusadas: 14 },
]

export const DEMO_MODAL = [
  { modal: 'MARITIMO', count: 120, pct: 60, cor: '#34d399' }, // 60% Maritime quotes
  { modal: 'AEREO', count: 80, pct: 40, cor: '#a78bfa' },    // 40% Air quotes (colors match the globe route lines)
]

export const DEMO_MELHOR_COTACAO = {
  numero: 'OF-2028-0142',
  origem: 'Shanghai (CNSHA)',
  destino: 'Santos (BRSSZ)',
  modal: 'MARITIMO' as const,
  saving_pct: 23.4,
  saving_valor: 12480,
  valor_aprovado: 80480,
  fornecedor: 'Pacific Cargo (E96)',
  transit_time: 32,
}

export const DEMO_INCOTERMS = [
  { incoterm: 'FOB', count: 88, pct: 44 },
  { incoterm: 'CIF', count: 62, pct: 31 },
  { incoterm: 'EXW', count: 38, pct: 19 },
  { incoterm: 'DAP', count: 12, pct: 6 },
  { incoterm: 'CFR', count: 0, pct: 0 },
]
